import { useState, useRef } from 'react';
import { Upload, FileText, Check } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

const UploadZone = ({ onFileSelected, label = 'Drop your PDF here or click to browse', accept = '.pdf', maxSizeMB = 50 }: UploadZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (selectedFile) {
    return (
      <div className="border border-success/30 bg-success/5 rounded-xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-medium text-foreground text-sm truncate">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
        <Check className="w-5 h-5 text-success" />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
        dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <Upload className={`w-8 h-8 mx-auto mb-3 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
      <p className="font-sans text-sm text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground font-sans mt-1">PDF only · Max {maxSizeMB}MB</p>
    </div>
  );
};

export default UploadZone;
