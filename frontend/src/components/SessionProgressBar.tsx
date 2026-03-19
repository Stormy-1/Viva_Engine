interface SessionProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const SessionProgressBar = ({ current, total, label }: SessionProgressBarProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-sans text-muted-foreground">Card {current} of {total}</span>
        {label && <span className="text-sm font-sans text-muted-foreground">{label}</span>}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
              i < current ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SessionProgressBar;
