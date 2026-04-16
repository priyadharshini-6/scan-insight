import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanUploadProps {
  onFileSelected: (file: File) => void;
  preview: string | null;
  onClear: () => void;
  isAnalyzing: boolean;
}

export function ScanUpload({ onFileSelected, preview, onClear, isAnalyzing }: ScanUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) onFileSelected(file);
    },
    [onFileSelected]
  );

  if (preview) {
    return (
      <div className="relative group">
        <div className="rounded-lg overflow-hidden border border-border shadow-card">
          <img src={preview} alt="Scan preview" className="w-full h-auto max-h-[400px] object-contain bg-muted/30" />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium text-primary">Analyzing scan...</p>
              </div>
            </div>
          )}
        </div>
        {!isAnalyzing && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
        isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,.dcm"
        onChange={handleFileInput}
        className="hidden"
        id="scan-upload"
      />
      <label htmlFor="scan-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full medical-gradient flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Drop your medical scan here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse • JPG, PNG, DICOM</p>
        </div>
        <div className="flex gap-2 mt-2">
          {["X-ray", "MRI", "CT", "Ultrasound"].map((type) => (
            <span key={type} className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
              {type}
            </span>
          ))}
        </div>
      </label>
    </div>
  );
}

function isValidFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "application/dicom"];
  return validTypes.includes(file.type) || file.name.endsWith(".dcm");
}
