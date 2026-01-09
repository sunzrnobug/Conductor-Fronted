export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';

export interface ServiceInterface {
  id: string;
  name: string;
  type: string;
}

export interface MicroserviceNodeData extends Record<string, unknown> {
  label: string;
  serviceName?: string; // Added service name
  description?: string;
  inputs: ServiceInterface[];
  outputs: ServiceInterface[];
  status: NodeStatus;
  db?: string;
  logs?: string[];
}
