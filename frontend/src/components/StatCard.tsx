interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
}

const StatCard = ({ value, label, icon }: StatCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-warm transition-shadow duration-200">
      <div className="font-mono text-2xl font-medium text-primary">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </div>
      <div className="text-sm text-muted-foreground font-sans mt-1">{label}</div>
    </div>
  );
};

export default StatCard;
