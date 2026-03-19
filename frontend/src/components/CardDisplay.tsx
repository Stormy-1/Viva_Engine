import { Card } from '@/lib/mockData';
import { FileText } from 'lucide-react';

interface CardDisplayProps {
  card: Card;
  mode?: 'voice' | 'silent';
}

const CardDisplay = ({ card }: CardDisplayProps) => {
  return (
    <div className="text-center">
      {card.isLeech && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-sans mb-4">
          🔴 Difficult concept — needs review
        </div>
      )}
      <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed mb-4">
        {card.questionText}
      </h2>
      <div className="inline-flex items-center gap-1.5 text-muted-foreground font-mono text-sm">
        <FileText className="w-3.5 h-3.5" />
        {card.sourceRef}
      </div>
    </div>
  );
};

export default CardDisplay;
