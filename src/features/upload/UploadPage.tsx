import { useState } from "react";
import { Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    console.log("Uploading:", selectedFile);
    // Mock API call
    alert("Microapplication uploaded successfully (Mock)");
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl backdrop-blur-md bg-card/50 border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Upload Microapplication
          </CardTitle>
          <CardDescription>
            Upload your compiled JAR and configuration YML files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300",
              dragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/5",
              selectedFile ? "border-green-500/50 bg-green-500/5" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleChange}
              accept=".jar,.yml,.yaml"
            />

            {selectedFile ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2 text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-center group"
              >
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium group-hover:text-primary transition-colors">
                  Drag & drop or click to upload
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports .jar and .yml files
                </p>
              </label>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t border-border/50 pt-6">
          <Button variant="ghost" onClick={() => setSelectedFile(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="w-32"
          >
            Upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
