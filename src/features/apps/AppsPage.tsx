import { useState } from "react";
import {
  Download,
  Settings,
  Database,
  Cloud,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MicroApp {
  id: string;
  name: string;
  description: string;
  version: string;
  servicesCount: number;
  createdAt: string;
  thumbnail: string;
}

const initialApps: MicroApp[] = [
  {
    id: "1",
    name: "E-commerce Core",
    description: "Core order processing and user management system.",
    version: "1.2.0",
    servicesCount: 4,
    createdAt: "2025-01-05",
    thumbnail: "bg-gradient-to-br from-purple-500 to-indigo-600",
  },
  {
    id: "2",
    name: "Analytics Dashboard",
    description: "Real-time data visualization and reporting app.",
    version: "0.8.5",
    servicesCount: 2,
    createdAt: "2025-01-08",
    thumbnail: "bg-gradient-to-br from-emerald-400 to-cyan-600",
  },
];

export default function AppsPage() {
  // Apps Page Component
  const [apps] = useState<MicroApp[]>(initialApps);
  const [selectedApp, setSelectedApp] = useState<MicroApp | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [deployEnv, setDeployEnv] = useState<"docker" | "k8s">("docker");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate Pagination
  const totalPages = Math.ceil(apps.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApps = apps.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDownloadClick = (app: MicroApp) => {
    setSelectedApp(app);
    setIsDownloadOpen(true);
  };

  const handleDownloadConfirm = () => {
    // Mock download logic
    const link = document.createElement("a");
    link.href = "#"; // Mock URL
    link.download = `${selectedApp?.name.replace(
      /\s+/g,
      "_"
    )}_${deployEnv}.zip`;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    alert(
      `Downloading ${selectedApp?.name} for ${
        deployEnv === "docker" ? "Docker Compose" : "Kubernetes"
      }...`
    );
    setIsDownloadOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          Application Delivery Management
        </h2>
        <p className="text-muted-foreground">
          Manage and deploy your exported microapplications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentApps.map((app) => (
          <Card
            key={app.id}
            className="group overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-card/50 backdrop-blur-sm"
          >
            <div className={`h-32 w-full ${app.thumbnail} relative`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">
                {app.name}
              </div>
            </div>
            <CardHeader>
              <CardDescription>{app.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">{app.version}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Services</span>
                <span>{app.servicesCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{app.createdAt}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                onClick={() => handleDownloadClick(app)}
              >
                <Download className="h-4 w-4" /> Deploy / Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Download Configuration Dialog */}
      <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure Deployment</DialogTitle>
            <DialogDescription>
              Prepare your microapplication package for download.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Environment */}
            <div className="space-y-3">
              <Label className="text-base">1. Select Environment</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    deployEnv === "docker"
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => setDeployEnv("docker")}
                >
                  <Box className="h-8 w-8" />
                  <span className="font-medium">Docker Compose</span>
                  {deployEnv === "docker" && (
                    <CheckCircle2 className="h-4 w-4 text-primary absolute top-2 right-2" />
                  )}
                </div>
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    deployEnv === "k8s"
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => setDeployEnv("k8s")}
                >
                  <Cloud className="h-8 w-8" />
                  <span className="font-medium">Kubernetes</span>
                  {deployEnv === "k8s" && (
                    <CheckCircle2 className="h-4 w-4 text-primary absolute top-2 right-2" />
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: DB Configuration Mock */}
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                2. Database Configuration
                <span className="text-xs font-normal text-muted-foreground">
                  (Auto-detected)
                </span>
              </Label>
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span>users_db (PostgreSQL)</span>
                  <span className="ml-auto text-green-500 text-xs">
                    Connected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-yellow-500" />
                  <span>orders_db (MySQL)</span>
                  <span className="ml-auto text-yellow-500 text-xs">
                    Pending Config
                  </span>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
              >
                <Settings className="h-3 w-3 mr-1" /> Adjust Database Settings
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDownloadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadConfirm} className="gap-2">
              <Download className="h-4 w-4" /> Download Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
