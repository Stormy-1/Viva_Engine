import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Mic, ArrowRight } from 'lucide-react';

const subjects = ['Fluid Mechanics', 'Thermodynamics', 'Mechanics of Materials', 'Machine Design', 'Heat Transfer'];

const steps = [
  { icon: Upload, num: '01', title: 'Upload', desc: 'Drop any engineering PDF. We extract every formula, diagram, and concept.' },
  { icon: Sparkles, num: '02', title: 'Generate', desc: 'AI creates voice-first exam questions grounded in your exact textbook.' },
  { icon: Mic, num: '03', title: 'Practice', desc: 'Answer verbally. Get concept-by-concept feedback in under 10 seconds.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background grain-overlay">
      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.15) 0%, rgba(15,14,13,0) 70%), hsl(20, 8%, 5%)',
        }}
      >
        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5">
          <span className="font-serif text-lg text-foreground">Viva Engine</span>
          <Link to="/dashboard" className="text-sm text-muted-foreground font-sans hover:text-foreground transition-colors">
            Open App →
          </Link>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-sans mb-8">
            ✦ AI-Powered Oral Exam Practice
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-foreground leading-[1.1] mb-6">
            Stop reading.<br />Start explaining.
          </h1>

          <p className="font-sans text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your engineering textbook. The AI generates viva questions grounded in your material. Answer verbally. Get graded instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              to="/upload"
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Upload Your First Chapter <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-8 py-3 rounded-full border border-border text-muted-foreground font-sans text-sm hover:text-foreground hover:border-foreground/20 transition-colors">
              ▶ Watch Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm font-mono text-muted-foreground">
            <span><span className="text-primary font-medium">78%</span> avg accuracy</span>
            <span className="text-border">·</span>
            <span><span className="text-primary font-medium">247</span> cards reviewed</span>
            <span className="text-border">·</span>
            <span><span className="text-primary font-medium">12 days</span> streak</span>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl text-foreground text-center mb-16"
          >
            How it works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-warm transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-mono text-xs text-primary">{step.num}</span>
                <h3 className="font-serif text-xl text-foreground mt-1 mb-2">{step.title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subject tags */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-sm text-muted-foreground mb-6">Designed for engineering vivas</p>
          <div className="flex flex-wrap justify-center gap-2">
            {subjects.map((s) => (
              <span key={s} className="px-4 py-1.5 rounded-full bg-card border border-border text-xs font-sans text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
