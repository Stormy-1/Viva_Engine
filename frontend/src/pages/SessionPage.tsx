import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Keyboard, Check, X, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import SessionLayout from '@/components/SessionLayout';
import SessionProgressBar from '@/components/SessionProgressBar';
import CardDisplay from '@/components/CardDisplay';
import VoiceRecorder from '@/components/VoiceRecorder';
import { mockCards, mockGradingResultPass, mockGradingResultFail } from '@/lib/mockData';
import type { GradingResult } from '@/lib/mockData';

type SessionPhase = 'start' | 'question' | 'processing' | 'result' | 'complete';

const SessionPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<SessionPhase>('start');
  const [mode, setMode] = useState<'voice' | 'silent'>('voice');
  const [cardIndex, setCardIndex] = useState(0);
  const [results, setResults] = useState<GradingResult[]>([]);
  const [currentResult, setCurrentResult] = useState<GradingResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState('');

  const card = mockCards[cardIndex];
  const totalCards = mockCards.length;

  const handleRecordingComplete = useCallback((_blob: Blob) => {
    setPhase('processing');
    setProcessingStatus('Transcribing...');
    setTimeout(() => setProcessingStatus('Analyzing concepts...'), 800);
    setTimeout(() => setProcessingStatus('Grading response...'), 1600);
    setTimeout(() => {
      const result = Math.random() > 0.4 ? mockGradingResultPass : mockGradingResultFail;
      setCurrentResult(result);
      setResults((prev) => [...prev, result]);
      setPhase('result');
    }, 2400);
  }, []);

  const nextCard = () => {
    if (cardIndex + 1 >= totalCards) {
      setPhase('complete');
    } else {
      setCardIndex((i) => i + 1);
      setCurrentResult(null);
      setPhase('question');
    }
  };

  const retryCard = () => {
    setCurrentResult(null);
    setPhase('question');
  };

  const passCount = results.filter((r) => r.passed).length;
  const accuracy = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;

  return (
    <SessionLayout>
      <AnimatePresence mode="wait">
        {/* START */}
        {phase === 'start' && (
          <motion.div key="start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center">
            <h1 className="font-serif text-3xl text-foreground mb-2">{totalCards} cards to review</h1>
            <p className="font-mono text-sm text-muted-foreground mb-8">~10 minutes</p>

            <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
              <button
                onClick={() => setMode('voice')}
                className={`p-5 rounded-xl border text-center transition-all ${
                  mode === 'voice' ? 'border-primary bg-primary/5 shadow-warm' : 'border-border bg-card'
                }`}
              >
                <Mic className={`w-6 h-6 mx-auto mb-2 ${mode === 'voice' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="block font-sans font-medium text-sm text-foreground">Voice Mode</span>
                <span className="block text-xs text-muted-foreground font-sans mt-1">Answer verbally</span>
              </button>
              <button
                onClick={() => setMode('silent')}
                className={`p-5 rounded-xl border text-center transition-all ${
                  mode === 'silent' ? 'border-primary bg-primary/5 shadow-warm' : 'border-border bg-card'
                }`}
              >
                <Keyboard className={`w-6 h-6 mx-auto mb-2 ${mode === 'silent' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="block font-sans font-medium text-sm text-foreground">Silent Mode</span>
                <span className="block text-xs text-muted-foreground font-sans mt-1">Type answers</span>
              </button>
            </div>

            <button
              onClick={() => setPhase('question')}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Begin Session
            </button>
          </motion.div>
        )}

        {/* QUESTION */}
        {phase === 'question' && card && (
          <motion.div key={`q-${cardIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <SessionProgressBar current={cardIndex + 1} total={totalCards} label={card.sourceRef.split('·')[0]} />
            <div className="mt-12 mb-12">
              <CardDisplay card={card} mode={mode} />
            </div>
            {mode === 'voice' ? (
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            ) : (
              <div className="space-y-3">
                <textarea
                  className="w-full bg-card border border-border rounded-xl p-4 text-foreground font-sans text-sm resize-none focus:border-primary focus:outline-none"
                  rows={4}
                  placeholder="Type your answer..."
                />
                <button
                  onClick={() => handleRecordingComplete(new Blob())}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-sans font-medium text-sm"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* PROCESSING */}
        {phase === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SessionProgressBar current={cardIndex + 1} total={totalCards} />
            <div className="mt-20">
              <VoiceRecorder onRecordingComplete={() => {}} isProcessing processingStatus={processingStatus} />
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {phase === 'result' && currentResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <SessionProgressBar current={cardIndex + 1} total={totalCards} />
            <div className={`mt-8 p-6 rounded-2xl border ${
              currentResult.passed
                ? 'bg-success/[0.06] border-success/20'
                : 'bg-destructive/[0.06] border-destructive/20'
            }`}>
              <div className="text-center mb-5">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${
                  currentResult.passed ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  {currentResult.passed ? <Check className="w-6 h-6 text-success" /> : <X className="w-6 h-6 text-destructive" />}
                </div>
                <h2 className="font-serif text-2xl text-foreground">
                  {currentResult.passed ? 'Correct!' : 'Incomplete'}
                </h2>
              </div>

              {currentResult.conceptsMentioned.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-sans mb-2">You covered:</p>
                  <ul className="space-y-1.5">
                    {currentResult.conceptsMentioned.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm font-sans text-success">
                        <Check className="w-4 h-4 mt-0.5 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentResult.conceptsMissed.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-sans mb-2">But missed:</p>
                  <ul className="space-y-1.5">
                    {currentResult.conceptsMissed.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm font-sans text-destructive">
                        <X className="w-4 h-4 mt-0.5 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentResult.passed && (
                <p className="text-xs text-muted-foreground font-mono mt-3">Next review: in 3 days</p>
              )}

              <div className="flex gap-2 mt-6">
                {!currentResult.passed && (
                  <button onClick={retryCard} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-sans">
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                )}
                {!currentResult.passed && (
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-border text-muted-foreground text-sm font-sans hover:text-foreground">
                    <BookOpen className="w-4 h-4" /> See Explanation
                  </button>
                )}
                <button onClick={nextCard} className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-sans ${
                  currentResult.passed
                    ? 'flex-1 bg-primary text-primary-foreground'
                    : 'px-4 text-muted-foreground hover:text-foreground'
                }`}>
                  {currentResult.passed ? <>Next Card <ArrowRight className="w-4 h-4" /></> : 'Move On'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPLETE */}
        {phase === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="font-serif text-3xl text-foreground mb-2">Session Complete!</h1>
            <p className="text-sm text-muted-foreground font-sans mb-8">Great work today</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="font-mono text-2xl text-primary font-medium">{passCount}/{results.length}</div>
                <div className="text-xs text-muted-foreground font-sans mt-1">Correct</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="font-mono text-2xl text-primary font-medium">{accuracy}%</div>
                <div className="text-xs text-muted-foreground font-sans mt-1">Accuracy</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="font-mono text-2xl text-primary font-medium">🔥 12</div>
                <div className="text-xs text-muted-foreground font-sans mt-1">Day Streak</div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-mono mb-8">Next review: Tomorrow at 9:00 AM</p>

            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/progress')} className="px-6 py-2.5 rounded-full border border-border text-sm font-sans text-muted-foreground hover:text-foreground">
                View Progress
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-sans">
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SessionLayout>
  );
};

export default SessionPage;
