import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface Step {
  label: string;
  status: 'complete' | 'active' | 'pending';
}

interface ProcessingStatusProps {
  steps: Step[];
  subtitle?: string;
}

const ProcessingStatus = ({ steps, subtitle }: ProcessingStatusProps) => {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {step.status === 'complete' && <Check className="w-4 h-4 text-success" />}
            {step.status === 'active' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
          </div>
          <span
            className={`font-sans text-sm ${
              step.status === 'complete' ? 'text-success' :
              step.status === 'active' ? 'text-primary' :
              'text-muted-foreground'
            }`}
          >
            {step.label}
          </span>
        </motion.div>
      ))}
      {subtitle && (
        <p className="text-xs text-muted-foreground font-mono mt-4 pl-9">{subtitle}</p>
      )}
    </div>
  );
};

export default ProcessingStatus;
