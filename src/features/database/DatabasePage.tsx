import { useState } from "react";
import {
  Database,
  Upload,
  FileSpreadsheet,
  Trash2,
  Eye,
  Save,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Link,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface DatabaseItem {
  id: string;
  name: string;
  type: "PostgreSQL" | "MySQL" | "SQLite" | "MinIO";
  size: string;
  records: number;
  lastModified: string;
}

const initialDatabases: DatabaseItem[] = [
  {
    id: "1",
    name: "users_db",
    type: "PostgreSQL",
    size: "1.2 GB",
    records: 15000,
    lastModified: "2025-01-08",
  },
  {
    id: "2",
    name: "orders_db",
    type: "MySQL",
    size: "850 MB",
    records: 4500,
    lastModified: "2025-01-07",
  },
  {
    id: "3",
    name: "local_store",
    type: "SQLite",
    size: "256 MB",
    records: 0,
    lastModified: "2025-01-08",
  },
];

const mockData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
];

export default function DatabasePage() {
  const { theme } = useTheme();
  const [databases, setDatabases] = useState<DatabaseItem[]>(initialDatabases);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDb, setPreviewDb] = useState<DatabaseItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadType, setUploadType] = useState<string>("PostgreSQL");

  // MinIO Connection State
  const [minioConfig, setMinioConfig] = useState({
    ip: "",
    port: "",
    bucket: "",
  });

  // Remote Connection State
  const [connectionMode, setConnectionMode] = useState<"file" | "remote">(
    "file"
  );
  const [remoteConfig, setRemoteConfig] = useState({
    ip: "",
    port: "",
    dbName: "",
    username: "",
    password: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate Pagination
  const totalPages = Math.ceil(databases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDatabases = databases.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);

  const handleUpload = () => {
    if (uploadType === "MinIO") {
      if (!minioConfig.ip || !minioConfig.port || !minioConfig.bucket) return;
      const newDb: DatabaseItem = {
        id: Math.random().toString(),
        name: minioConfig.bucket,
        type: "MinIO",
        size: "0 MB", // Initial size
        records: 0,
        lastModified: new Date().toISOString().split("T")[0],
      };
      setDatabases([...databases, newDb]);
      setMinioConfig({ ip: "", port: "", bucket: "" });
    } else {
      if (connectionMode === "file") {
        if (!selectedFile) return;
        const newDb: DatabaseItem = {
          id: Math.random().toString(),
          name: selectedFile.name.split(".")[0],
          type: uploadType as any,
          size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
          records: 0,
          lastModified: new Date().toISOString().split("T")[0],
        };
        setDatabases([...databases, newDb]);
        setSelectedFile(null);
      } else {
        if (!remoteConfig.ip || !remoteConfig.port || !remoteConfig.dbName)
          return;
        const newDb: DatabaseItem = {
          id: Math.random().toString(),
          name: remoteConfig.dbName,
          type: uploadType as any,
          size: "Remote",
          records: 0,
          lastModified: new Date().toISOString().split("T")[0],
        };
        setDatabases([...databases, newDb]);
        setRemoteConfig({
          ip: "",
          port: "",
          dbName: "",
          username: "",
          password: "",
        });
      }
    }
  };

  const handlePreview = (db: DatabaseItem) => {
    setPreviewDb(db);
    setEditedData([...mockData]); // Reset edited data with fresh mock data
    setIsEditing(false);
    setIsPreviewOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this database?")) {
      setDatabases(databases.filter((d) => d.id !== id));
    }
  };

  const handleCellChange = (id: number, field: string, value: string) => {
    setEditedData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSaveData = () => {
    console.log("Saving data:", editedData);
    alert("Database changes saved successfully (Mock)");
    setIsEditing(false);
  };

  const getDbLogo = (type: string) => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const suffix = isDark ? "-dark" : "";

    if (type === "PostgreSQL") return `/images/pg${suffix}.png`;
    if (type === "MySQL") return `/images/mysql${suffix}.png`;
    if (type === "SQLite") return `/images/sqlite${suffix}.png`;
    if (type === "MinIO") return `/images/minio${suffix}.png`;
    return null;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Database Governance
          </h2>
          <p className="text-muted-foreground">
            Manage, inspect, and modify database resources.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {/* Upload/Connect Card */}
        <Card className="md:col-span-1 border-dashed border-2 border-muted hover:border-primary/50 transition-colors bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadType === "MinIO" ? (
                <Link className="h-5 w-5" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              {uploadType === "MinIO"
                ? "Connect Data Source"
                : "Upload Database"}
            </CardTitle>
            <CardDescription>
              {uploadType === "MinIO"
                ? "Connect to MinIO Object Storage"
                : "Support .sql, .dump files"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="db-type">Source Type</Label>
              <select
                id="db-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
              >
                <option>PostgreSQL</option>
                <option>MySQL</option>
                <option>SQLite</option>
                <option>MinIO</option>
              </select>
            </div>

            {uploadType === "MinIO" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 grid w-full items-center gap-1.5">
                    <Label htmlFor="minio-ip">IP Address</Label>
                    <Input
                      id="minio-ip"
                      placeholder="127.0.0.1"
                      value={minioConfig.ip}
                      onChange={(e) =>
                        setMinioConfig({ ...minioConfig, ip: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="minio-port">Port</Label>
                    <Input
                      id="minio-port"
                      placeholder="9000"
                      value={minioConfig.port}
                      onChange={(e) =>
                        setMinioConfig({ ...minioConfig, port: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="minio-bucket">Bucket Name</Label>
                  <Input
                    id="minio-bucket"
                    placeholder="my-bucket"
                    value={minioConfig.bucket}
                    onChange={(e) =>
                      setMinioConfig({ ...minioConfig, bucket: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    variant={connectionMode === "file" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setConnectionMode("file")}
                    className="flex-1 h-7 text-xs"
                  >
                    File Upload
                  </Button>
                  <Button
                    variant={
                      connectionMode === "remote" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setConnectionMode("remote")}
                    className="flex-1 h-7 text-xs"
                  >
                    Remote Connect
                  </Button>
                </div>

                {connectionMode === "file" ? (
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="file">File</Label>
                    <div
                      className="relative border-2 border-dashed rounded-lg p-8 hover:bg-muted/50 transition-colors text-center cursor-pointer border-muted-foreground/25 hover:border-primary/50 group"
                      onClick={() => document.getElementById("file")?.click()}
                    >
                      <input
                        id="file"
                        type="file"
                        accept=".sql,.dump"
                        className="hidden"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                      />
                      <div className="flex flex-col items-center gap-2">
                        {selectedFile ? (
                          <>
                            <FileSpreadsheet className="h-10 w-10 text-primary animate-bounce" />
                            <div className="text-sm font-medium text-foreground">
                              {selectedFile.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <span className="text-xs text-primary hover:underline mt-2 font-medium">
                              Change file
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors">
                              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-sm font-medium mt-2">
                              Click to upload
                            </div>
                            <div className="text-xs text-muted-foreground">
                              or drag and drop .sql, .dump
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 grid w-full items-center gap-1.5">
                        <Label htmlFor="remote-ip">IP Address</Label>
                        <Input
                          id="remote-ip"
                          placeholder="127.0.0.1"
                          value={remoteConfig.ip}
                          onChange={(e) =>
                            setRemoteConfig({
                              ...remoteConfig,
                              ip: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="remote-port">Port</Label>
                        <Input
                          id="remote-port"
                          placeholder="5432"
                          value={remoteConfig.port}
                          onChange={(e) =>
                            setRemoteConfig({
                              ...remoteConfig,
                              port: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="remote-dbname">Database Name</Label>
                      <Input
                        id="remote-dbname"
                        placeholder="my_database"
                        value={remoteConfig.dbName}
                        onChange={(e) =>
                          setRemoteConfig({
                            ...remoteConfig,
                            dbName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={
                uploadType === "MinIO"
                  ? !minioConfig.ip || !minioConfig.port || !minioConfig.bucket
                  : connectionMode === "file"
                  ? !selectedFile
                  : !remoteConfig.ip ||
                    !remoteConfig.port ||
                    !remoteConfig.dbName
              }
              onClick={handleUpload}
            >
              {uploadType === "MinIO" || connectionMode === "remote"
                ? "Connect"
                : "Upload"}
            </Button>
          </CardFooter>
        </Card>

        {/* Database List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentDatabases.map((db) => (
              <Card
                key={db.id}
                className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {db.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center h-40 py-4">
                    {getDbLogo(db.type) ? (
                      <img
                        src={getDbLogo(db.type)!}
                        alt={db.type}
                        className="h-full w-auto max-w-full object-contain drop-shadow-md transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <Database className="h-24 w-24 text-muted-foreground/20" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {db.size} • {db.records.toLocaleString()} records
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(db)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(db.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-2">
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
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Data Preview: {previewDb?.name}
            </DialogTitle>
            <DialogDescription>
              View and edit data records. Changes are saved automatically
              (Mock).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isEditing ? editedData : mockData).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={row.name}
                          onChange={(e) =>
                            handleCellChange(row.id, "name", e.target.value)
                          }
                          className="h-8"
                        />
                      ) : (
                        row.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={row.email}
                          onChange={(e) =>
                            handleCellChange(row.id, "email", e.target.value)
                          }
                          className="h-8"
                        />
                      ) : (
                        row.email
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={row.role}
                          onChange={(e) =>
                            handleCellChange(row.id, "role", e.target.value)
                          }
                          className="h-8"
                        />
                      ) : (
                        row.role
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <Label
                htmlFor="edit-mode"
                className="text-sm text-muted-foreground"
              >
                Edit Mode
              </Label>
              <Button
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Editing On" : "Editing Off"}
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Close
              </Button>
              {isEditing && (
                <Button
                  onClick={handleSaveData}
                  className="flex-1 sm:flex-none"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
