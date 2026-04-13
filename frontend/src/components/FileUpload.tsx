/**
 * FileUpload.tsx — Drag-and-drop PDF upload component for Viva Engine.
 *
 * Wired to POST /api/extract/test — returns Docling extraction results.
 * Docling returns: page_number, markdown, raw_text, formulas (string[]), summary.
 */

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

/** One page of content as returned by DoclingService.to_dict() */
interface PageContent {
  page_number: number;
  markdown: string;
  raw_text: string;
  formulas: string[];   // LaTeX strings, e.g. "$$E = mc^2$$"
  summary: string;      // Empty until question-gen phase fills it
}

interface ExtractionResult {
  filename: string;
  pages_extracted: number;
  total_pages: number;
  file_size_mb: number;
  pages: PageContent[];
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function FileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are accepted.";
    if (file.size > 10 * 1024 * 1024) return "File must be under 10 MB.";
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setUploadState("error");
      return;
    }
    setSelectedFile(file);
    setErrorMessage("");
    setResult(null);
    setUploadState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadState("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    // Simulate progress during upload
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 90));
    }, 400);

    try {
      const res = await fetch("/api/extract/test", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Server error: ${res.status}`);
      }

      const data: ExtractionResult = await res.json();
      setResult(data);
      setUploadState("success");
    } catch (err) {
      clearInterval(progressInterval);
      setErrorMessage(err instanceof Error ? err.message : "Upload failed.");
      setUploadState("error");
    }
  };

  const reset = () => {
    setUploadState("idle");
    setSelectedFile(null);
    setResult(null);
    setErrorMessage("");
    setProgress(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 select-none
          ${dragOver
            ? "border-violet-400 bg-violet-950/30 scale-[1.02]"
            : "border-white/20 bg-white/5 hover:border-violet-500/60 hover:bg-white/10"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-3">
          {selectedFile ? (
            <FileText className="w-12 h-12 text-violet-400" />
          ) : (
            <Upload className="w-12 h-12 text-white/40" />
          )}

          {selectedFile ? (
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-white/50 text-sm">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white/70 font-medium">Drop a PDF here or click to browse</p>
              <p className="text-white/40 text-sm mt-1">PDF only · Max 10 MB · First 3 pages extracted</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {selectedFile && uploadState !== "success" && (
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploadState === "uploading"}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
              bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold transition-colors"
          >
            {uploadState === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting ({progress}%)…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Extract PDF
              </>
            )}
          </button>
          <button
            onClick={reset}
            disabled={uploadState === "uploading"}
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white
              disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {uploadState === "uploading" && (
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {uploadState === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Success Results */}
      {uploadState === "success" && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                Extracted {result.pages_extracted} page{result.pages_extracted !== 1 ? "s" : ""}
              </span>
            </div>
            <button onClick={reset} className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Upload another
            </button>
          </div>

          {result.pages.map((page) => (
            <div key={page.page_number} className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider">
                Page {page.page_number}
              </h3>

              {/* Raw text preview — summary is filled later at question-gen phase */}
              {page.raw_text && (
                <p className="text-white/60 text-sm leading-relaxed line-clamp-4">
                  {page.raw_text.slice(0, 400)}{page.raw_text.length > 400 ? "…" : ""}
                </p>
              )}

              {/* LaTeX formulas extracted by Docling */}
              {page.formulas.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">
                    Formulas ({page.formulas.length})
                  </p>
                  {page.formulas.map((formula, i) => (
                    <code key={i} className="block text-yellow-300 text-xs bg-black/30 px-3 py-1.5 rounded mb-1 font-mono">
                      {formula}
                    </code>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
