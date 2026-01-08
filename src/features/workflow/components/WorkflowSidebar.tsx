import { type DragEvent } from "react";
import { Server, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const availableServices = [
  {
    type: "microapplication",
    label: "User Microapplication",
    data: {
      inputs: [{ id: "in-1", name: "Auth Token", type: "String" }],
      outputs: [{ id: "out-1", name: "User Profile", type: "JSON" }],
    },
  },
  {
    type: "microapplication",
    label: "Order Microapplication",
    data: {
      inputs: [
        { id: "in-2", name: "User ID", type: "String" },
        { id: "in-3", name: "Cart ID", type: "String" },
      ],
      outputs: [{ id: "out-2", name: "Order Details", type: "JSON" }],
    },
  },
  {
    type: "microapplication",
    label: "Payment Microapplication",
    data: {
      inputs: [
        { id: "in-4", name: "Order ID", type: "String" },
        { id: "in-5", name: "Amount", type: "Number" },
      ],
      outputs: [{ id: "out-3", name: "Transaction ID", type: "String" }],
    },
  },
  {
    type: "microapplication",
    label: "Notification Microapplication",
    data: {
      inputs: [
        { id: "in-6", name: "User ID", type: "String" },
        { id: "in-7", name: "Message", type: "String" },
      ],
      outputs: [{ id: "out-4", name: "Status", type: "Boolean" }],
    },
  },
];

export function WorkflowSidebar() {
  const onDragStart = (event: DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData(
      "application/nodedata",
      JSON.stringify(nodeData)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Component Library
        </h3>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {availableServices.map((service) => (
          <div
            key={service.label}
            className={cn(
              "p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all group",
              "flex items-center gap-3"
            )}
            onDragStart={(event) =>
              onDragStart(event, service.type, {
                ...service.data,
                label: service.label,
              })
            }
            draggable
          >
            <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <Server className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{service.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {service.data.inputs.length} In • {service.data.outputs.length}{" "}
                Out
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
