import { FileText } from 'lucide-react';
import type { Document } from '@/lib/mockData';

interface DocumentCardProps {
  doc: Document;
  onStudy?: () => void;
}

const DocumentCard = ({ doc, onStudy }: DocumentCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-warm transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-sans font-semibold text-foreground text-sm truncate">{doc.filename}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                doc.status === 'ready' ? 'bg-success' : 'bg-warning status-pulse'
              }`}
            />
            <span className="text-xs text-muted-foreground font-sans capitalize">{doc.status}</span>
          </div>
        </div>
      </div>

      <div className="font-mono text-xs text-muted-foreground mb-3">
        {doc.cardCount} cards · {doc.dueCount} due today
      </div>

      {doc.syllabusMatch !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground font-sans">Syllabus coverage</span>
            <span className="text-primary font-mono">{doc.syllabusMatch}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${doc.syllabusMatch}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onStudy}
          className="flex-1 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-sans font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={doc.status !== 'ready'}
        >
          Study Now
        </button>
        <button className="px-3 py-2 rounded-full border border-border text-muted-foreground text-xs font-sans hover:text-foreground hover:border-foreground/20 transition-colors">
          Add Cards
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
