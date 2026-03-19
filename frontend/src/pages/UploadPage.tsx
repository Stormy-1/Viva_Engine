import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UploadZone from '@/components/UploadZone';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Check, X } from 'lucide-react';

type UploadStep = 'upload' | 'processing' | 'results';

const intensities = [
  { label: 'Light', cards: 10, time: '~15 min/day' },
  { label: 'Standard', cards: 20, time: '~25 min/day', recommended: true },
  { label: 'Intensive', cards: 40, time: '~45 min/day' },
];

const coveredTopics = ['Bernoulli Equation', 'Continuity Equation', 'Reynolds Number', 'Pipe Flow', 'Boundary Layers'];
const missingTopics = ['Compressible Flow', 'Open Channel Flow'];

const UploadPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<UploadStep>('upload');
  const [selectedIntensity, setSelectedIntensity] = useState(1);

  const processingSteps = [
    { label: 'Uploading file...', status: 'complete' as const },
    { label: 'Scanning 24 pages...', status: 'complete' as const },
    { label: 'Extracting formulas & diagrams...', status: 'active' as const },
    { label: 'Building knowledge base...', status: 'pending' as const },
    { label: 'Generating embeddings...', status: 'pending' as const },
    { label: 'Indexing for search...', status: 'pending' as const },
  ];

  const handleFileSelected = () => {
    setStep('processing');
    setTimeout(() => setStep('results'), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['Upload', 'Processing', 'Generate'].map((s, i) => {
            const stepIndex = step === 'upload' ? 0 : step === 'processing' ? 1 : 2;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono ${
                  i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-sans ${i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                {i < 2 && <div className={`w-8 h-px ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h1 className="font-serif text-3xl text-foreground text-center mb-8">Add Study Material</h1>
              <UploadZone onFileSelected={handleFileSelected} />
              <details className="mt-6">
                <summary className="text-xs text-muted-foreground font-sans cursor-pointer hover:text-foreground">
                  Upload syllabus for coverage analysis (optional)
                </summary>
                <div className="mt-3">
                  <UploadZone onFileSelected={() => {}} label="Drop your syllabus here" />
                </div>
              </details>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center">
              <h1 className="font-serif text-2xl text-foreground mb-2">Processing your document...</h1>
              <p className="text-sm text-muted-foreground font-sans mb-8">Fluid_Mechanics_Ch3.pdf</p>
              <div className="text-left max-w-sm mx-auto">
                <ProcessingStatus steps={processingSteps} subtitle="⏱ ~2 minutes for 24 pages" />
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h1 className="font-serif text-3xl text-foreground text-center mb-2">Ready to Study! 🎓</h1>
              <div className="flex justify-center gap-4 my-6">
                {[{ v: '8', l: 'concepts' }, { v: '47', l: 'formulas' }, { v: '12', l: 'diagrams' }].map((s) => (
                  <span key={s.l} className="font-mono text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{s.v}</span> {s.l}
                  </span>
                ))}
              </div>

              {/* Coverage */}
              <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-sans text-muted-foreground">Syllabus Coverage</span>
                  <span className="font-mono text-primary">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary rounded-full" style={{ width: '92%' }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {coveredTopics.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs font-sans text-success bg-success/10 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" /> {t}
                    </span>
                  ))}
                  {missingTopics.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs font-sans text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                      <X className="w-3 h-3" /> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <p className="text-sm text-muted-foreground font-sans mb-3">Card intensity</p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {intensities.map((int, i) => (
                  <button
                    key={int.label}
                    onClick={() => setSelectedIntensity(i)}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                      i === selectedIntensity
                        ? 'border-primary bg-primary/5 shadow-warm'
                        : 'border-border bg-card hover:border-foreground/20'
                    }`}
                  >
                    <span className="block font-sans font-medium text-sm text-foreground">{int.label}</span>
                    {int.recommended && <span className="text-[10px] text-primary font-sans">★ Recommended</span>}
                    <span className="block font-mono text-xs text-muted-foreground mt-1">{int.cards} cards</span>
                    <span className="block font-mono text-[10px] text-muted-foreground">{int.time}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Generate Cards →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploadPage;
