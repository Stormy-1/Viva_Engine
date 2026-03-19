import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';

const SettingsPage = () => {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [cardsPerSession, setCardsPerSession] = useState(10);
  const [defaultMode, setDefaultMode] = useState<'voice' | 'silent'>('voice');
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
        <h1 className="font-serif text-3xl text-foreground mb-8">Settings</h1>

        {/* Study Preferences */}
        <section className="mb-8">
          <h2 className="font-serif text-lg text-foreground mb-4">Study Preferences</h2>
          <div className="space-y-4 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-sans text-foreground">Daily review time</label>
              <input type="time" defaultValue="09:00" className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-sans text-foreground">Cards per session</label>
              <input
                type="number"
                value={cardsPerSession}
                onChange={(e) => setCardsPerSession(Number(e.target.value))}
                className="w-20 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground text-right focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-sans text-foreground">Default mode</label>
              <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                {(['voice', 'silent'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setDefaultMode(m)}
                    className={`px-3 py-1 rounded-md text-xs font-sans capitalize transition-colors ${
                      defaultMode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <h2 className="font-serif text-lg text-foreground mb-4">Notifications</h2>
          <div className="space-y-4 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-sans text-foreground">Daily reminder</label>
              <button
                onClick={() => setDailyReminder(!dailyReminder)}
                className={`w-10 h-5 rounded-full transition-colors relative ${dailyReminder ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${dailyReminder ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            {dailyReminder && (
              <div>
                <label className="text-xs text-muted-foreground font-sans mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="font-serif text-lg text-foreground mb-4">Danger Zone</h2>
          <div className="bg-card border border-destructive/30 rounded-xl p-5">
            <p className="text-sm font-sans text-muted-foreground mb-3">This will permanently delete all your study data, cards, and progress.</p>
            {showConfirm ? (
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-sans text-muted-foreground">
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-sans">
                  Yes, delete everything
                </button>
              </div>
            ) : (
              <button onClick={() => setShowConfirm(true)} className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-sans hover:bg-destructive/10 transition-colors">
                Clear all study data
              </button>
            )}
          </div>
        </section>
      </motion.div>
    </DashboardLayout>
  );
};

export default SettingsPage;
