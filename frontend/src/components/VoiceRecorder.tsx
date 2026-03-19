import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxSeconds?: number;
  isProcessing?: boolean;
  processingStatus?: string;
}

const VoiceRecorder = ({ onRecordingComplete, maxSeconds = 60, isProcessing = false, processingStatus }: VoiceRecorderProps) => {
  const [state, setState] = useState<'idle' | 'recording' | 'error'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setState('recording');
      setSeconds(0);

      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s >= maxSeconds - 1) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setPermissionDenied(true);
      setState('error');
    }
  }, [maxSeconds, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (permissionDenied) {
    return (
      <div className="text-center p-6 bg-warning/10 border border-warning/20 rounded-xl">
        <p className="text-warning font-sans text-sm">🎤 Microphone access required</p>
        <p className="text-muted-foreground font-sans text-xs mt-1">Allow microphone access in your browser to continue</p>
        <button onClick={() => { setPermissionDenied(false); setState('idle'); }} className="mt-3 text-xs text-primary font-sans hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-sm font-sans text-muted-foreground animate-pulse">
          {processingStatus || 'Processing...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {state === 'recording' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-destructive/40 pulse-ring" />
            <div className="absolute inset-[-8px] rounded-full border border-destructive/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            state === 'recording'
              ? 'bg-destructive/10 border-2 border-destructive scale-110'
              : 'bg-card border-2 border-primary hover:border-primary/80 hover:shadow-warm-lg active:scale-95'
          }`}
        >
          <Mic className={`w-8 h-8 ${state === 'recording' ? 'text-destructive' : 'text-primary'}`} />
        </button>
      </div>

      {state === 'recording' && (
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full waveform-bar"
                style={{ minHeight: '8px' }}
              />
            ))}
          </div>
          <span className="font-mono text-sm text-foreground">{formatTime(seconds)}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground font-sans">
        {state === 'recording' ? 'Recording... release when done' : 'Hold to answer'}
      </p>
    </div>
  );
};

export default VoiceRecorder;
