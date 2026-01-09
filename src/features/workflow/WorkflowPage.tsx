import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { WorkflowSidebar } from "./components/WorkflowSidebar";
import { MicroserviceNode } from "./components/MicroserviceNode";
import { WorkflowContextMenu } from "./components/WorkflowContextMenu";
import { Play, Download, Archive, Save, Database, X, Edit } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Define custom node types
const nodeTypes = {
  microapplication: MicroserviceNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Temporary Button Component until Shadcn is fully set up
const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "primary",
}: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
      ${
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      }
    `}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

export default function WorkflowPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Archive & DB Mount State
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [archiveName, setArchiveName] = useState("");

  const [isDbMountDialogOpen, setIsDbMountDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedDb, setSelectedDb] = useState<string[]>([]);

  // Mock Databases available
  const availableDatabases = [
    "users_db",
    "orders_db",
    "local_store",
    "minio_storage",
  ];

  // Context Menu State
  const [menu, setMenu] = useState<{
    id: string;
    top: number;
    left: number;
  } | null>(null);

  // Description Edit State
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();

      if (reactFlowWrapper.current) {
        const pane = reactFlowWrapper.current.getBoundingClientRect();
        setMenu({
          id: node.id,
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
        });
      }
    },
    []
  );

  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleCopyNode = useCallback(() => {
    if (!menu) return;
    const nodeToCopy = nodes.find((n) => n.id === menu.id);
    if (nodeToCopy) {
      const position = {
        x: nodeToCopy.position.x + 50,
        y: nodeToCopy.position.y + 50,
      };

      const newNode: Node = {
        ...nodeToCopy,
        id: uuidv4(),
        position,
        data: {
          ...nodeToCopy.data,
          label: `${nodeToCopy.data.label} (Copy)`,
        },
        selected: false,
      };

      setNodes((nds) => nds.concat(newNode));
    }
    setMenu(null);
  }, [menu, nodes, setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (!menu) return;
    setNodes((nds) => nds.filter((n) => n.id !== menu.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== menu.id && e.target !== menu.id)
    );
    setMenu(null);
  }, [menu, setNodes, setEdges]);

  const handleEditDescriptionClick = useCallback(() => {
    if (!menu) return;
    const node = nodes.find((n) => n.id === menu.id);
    if (node) {
      setEditingNodeId(node.id);
      setDescriptionText((node.data.description as string) || "");
      setIsDescriptionDialogOpen(true);
    }
    setMenu(null);
  }, [menu, nodes]);

  const handleSaveDescription = () => {
    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === editingNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                description: descriptionText,
              },
            };
          }
          return node;
        })
      );
      setIsDescriptionDialogOpen(false);
      setEditingNodeId(null);
    }
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "hsl(var(--primary))" },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const dataString = event.dataTransfer.getData("application/nodedata");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const data = JSON.parse(dataString);

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { ...data, status: "idle" },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      const existingDb = node.data.db;
      // Handle legacy string or new array format
      if (Array.isArray(existingDb)) {
        setSelectedDb(existingDb as string[]);
      } else if (typeof existingDb === "string" && existingDb) {
        setSelectedDb([existingDb]);
      } else {
        setSelectedDb([]);
      }
      setIsDbMountDialogOpen(true);
    },
    []
  );

  const handleArchive = () => {
    setIsArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (archiveName) {
      console.log(`Archiving workflow as: ${archiveName}`);
      alert(`Workflow "${archiveName}" archived successfully!`);
      setIsArchiveDialogOpen(false);
      setArchiveName("");
    }
  };

  const handleSaveDbMount = () => {
    if (selectedNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                db: selectedDb,
              },
            };
          }
          return node;
        })
      );
      setIsDbMountDialogOpen(false);
    }
  };

  // Mock Run Function
  const handleRun = () => {
    // 1. Set all to running
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, status: "running" } }))
    );

    // 2. Simulate progressive success
    nodes.forEach((node, index) => {
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              // Randomly fail or warn for demo
              const rand = Math.random();
              let status = "success";
              if (rand > 0.9) status = "error";
              else if (rand > 0.8) status = "warning";

              return { ...n, data: { ...n.data, status } };
            }
            return n;
          })
        );
      }, (index + 1) * 1500);
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-background/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Workflow:{" "}
            <span className="text-foreground font-medium">New Workflow 01</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton icon={Play} label="Run" onClick={handleRun} />
          <ActionButton
            icon={Save}
            label="Save"
            variant="secondary"
            onClick={() => {}}
          />
          <ActionButton
            icon={Download}
            label="Export"
            variant="secondary"
            onClick={() => {}}
          />
          <ActionButton
            icon={Archive}
            label="Archive"
            variant="secondary"
            onClick={handleArchive}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <WorkflowSidebar />
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background/20"
          >
            <Background
              color="hsl(var(--muted-foreground))"
              gap={20}
              size={1}
              className="opacity-10"
            />
            <Controls className="bg-card border border-border text-foreground [&>button]:!bg-card [&>button]:!border-border [&>button:hover]:!bg-accent [&>button]:!text-foreground" />
            <MiniMap
              className="bg-card border border-border"
              nodeColor="hsl(var(--primary))"
              maskColor="rgba(0,0,0,0.5)"
            />
            {menu && (
              <WorkflowContextMenu
                {...menu}
                onCopy={handleCopyNode}
                onEditDescription={handleEditDescriptionClick}
                onDelete={handleDeleteNode}
                onClose={() => setMenu(null)}
              />
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Archive Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Archive Workflow
            </DialogTitle>
            <DialogDescription>
              Save the current workflow state to history archives.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="archive-name" className="mb-2 block">
              Archive Name
            </Label>
            <input
              id="archive-name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., v1.0-stable"
              value={archiveName}
              onChange={(e) => setArchiveName(e.target.value)}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
              className="sm:w-1/2"
            >
              Cancel
            </Button>
            <Button onClick={confirmArchive} className="sm:w-1/2">
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DB Mount Dialog */}
      <Dialog open={isDbMountDialogOpen} onOpenChange={setIsDbMountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Mount Database
            </DialogTitle>
            <DialogDescription>
              Associate a database resource with this microapplication node.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/20">
              <Database className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                Selected Node:{" "}
                {
                  nodes.find((n) => n.id === selectedNodeId)?.data
                    .label as string
                }
              </span>
            </div>

            <div className="space-y-2">
              <Label>Select Databases (Multi-select)</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableDatabases.map((db) => (
                  <div
                    key={db}
                    onClick={() =>
                      setSelectedDb((prev) =>
                        prev.includes(db)
                          ? prev.filter((d) => d !== db)
                          : [...prev, db]
                      )
                    }
                    className={`cursor-pointer border rounded-md p-3 flex items-center gap-2 transition-all ${
                      selectedDb.includes(db)
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                        selectedDb.includes(db)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedDb.includes(db) && (
                        <div className="h-2 w-2 rounded-[1px] bg-primary-foreground" />
                      )}
                    </div>
                    <Database
                      className={`h-4 w-4 ${
                        selectedDb.includes(db)
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-sm">{db}</span>
                  </div>
                ))}
                <div
                  onClick={() => setSelectedDb([])}
                  className="cursor-pointer border rounded-md p-3 flex items-center gap-2 transition-all border-destructive/50 hover:bg-destructive/10 text-destructive"
                >
                  <X className="h-4 w-4" />
                  <span className="text-sm">Clear All</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDbMountDialogOpen(false)}
              className="sm:w-1/2"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDbMount} className="sm:w-1/2">
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Edit Dialog */}
      <Dialog
        open={isDescriptionDialogOpen}
        onOpenChange={setIsDescriptionDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Node Description
            </DialogTitle>
            <DialogDescription>
              Add a brief description for this microapplication node.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="node-description" className="mb-2 block">
              Description
            </Label>
            <textarea
              id="node-description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Handles user authentication"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDescriptionDialogOpen(false)}
              className="sm:w-1/2"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDescription} className="sm:w-1/2">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
