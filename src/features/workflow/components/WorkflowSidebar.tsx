import { type DragEvent, useState } from "react";
import { Server, GripVertical, ChevronRight, ChevronDown, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const microservices = [
  {
    id: "ms-user",
    label: "User Service",
    interfaces: [
      {
        id: "if-login",
        label: "Login",
        type: "microapplication",
        data: {
          inputs: [
            { id: "in-user", name: "Username", type: "String" },
            { id: "in-pass", name: "Password", type: "String" },
          ],
          outputs: [{ id: "out-token", name: "Auth Token", type: "String" }],
        },
      },
      {
        id: "if-profile",
        label: "Get Profile",
        type: "microapplication",
        data: {
          inputs: [{ id: "in-token", name: "Auth Token", type: "String" }],
          outputs: [{ id: "out-profile", name: "User Profile", type: "JSON" }],
        },
      },
    ],
  },
  {
    id: "ms-order",
    label: "Order Service",
    interfaces: [
      {
        id: "if-create-order",
        label: "Create Order",
        type: "microapplication",
        data: {
          inputs: [
            { id: "in-uid", name: "User ID", type: "String" },
            { id: "in-cart", name: "Cart ID", type: "String" },
          ],
          outputs: [{ id: "out-oid", name: "Order ID", type: "String" }],
        },
      },
      {
        id: "if-order-status",
        label: "Get Order Status",
        type: "microapplication",
        data: {
          inputs: [{ id: "in-oid", name: "Order ID", type: "String" }],
          outputs: [{ id: "out-status", name: "Status", type: "String" }],
        },
      },
    ],
  },
  {
    id: "ms-payment",
    label: "Payment Service",
    interfaces: [
      {
        id: "if-process-payment",
        label: "Process Payment",
        type: "microapplication",
        data: {
          inputs: [
            { id: "in-oid", name: "Order ID", type: "String" },
            { id: "in-amount", name: "Amount", type: "Number" },
          ],
          outputs: [{ id: "out-txid", name: "Transaction ID", type: "String" }],
        },
      },
    ],
  },
];

const ServiceGroup = ({ service, onDragStart }: { service: any; onDragStart: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full p-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        <Box className="h-4 w-4 mr-2 text-primary/70" />
        {service.label}
      </button>

      {isOpen && (
        <div className="pl-4 space-y-2">
          {service.interfaces.map((iface: any) => (
            <div
              key={iface.id}
              className={cn(
                "p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all group",
                "flex items-center gap-3"
              )}
              onDragStart={(event) =>
                onDragStart(event, iface.type, {
                  ...iface.data,
                  label: iface.label,
                  serviceName: service.label, // Pass service name for context
                })
              }
              draggable
            >
              <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <Server className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{iface.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {iface.data.inputs.length} In • {iface.data.outputs.length}{" "}
                  Out
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
          Microservices
        </h3>
      </div>

      <div className="p-4 space-y-2 overflow-y-auto flex-1">
        {microservices.map((service) => (
          <ServiceGroup
            key={service.id}
            service={service}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </aside>
  );
}
