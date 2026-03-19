import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { mockStats, mockHeatmapData, mockAccuracyData, mockCards } from '@/lib/mockData';

const leechCards = mockCards.filter((c) => c.isLeech);

const ProgressPage = () => {
  const weeks = 12;
  const days = 7;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl text-foreground mb-8">Progress</h1>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard value={mockStats.totalReviewed} label="Total Reviewed" />
          <StatCard value={`${mockStats.averageAccuracy}%`} label="Avg Accuracy" />
          <StatCard value={mockStats.streak} label="Current Streak" icon="🔥" />
          <StatCard value={mockStats.cardsMastered} label="Cards Mastered" />
        </div>

        {/* Accuracy chart */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-lg text-foreground mb-4">Accuracy Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAccuracyData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8a8278' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#8a8278' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1917', border: '1px solid #2e2c29', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e8e4de' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-lg text-foreground mb-4">Review Activity</h2>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {Array.from({ length: weeks }).map((_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {Array.from({ length: days }).map((_, d) => {
                  const idx = w * 7 + d;
                  const data = mockHeatmapData[idx];
                  const count = data?.count ?? 0;
                  const opacity = count === 0 ? 0 : Math.min(count / 5, 1);
                  return (
                    <div
                      key={d}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: count === 0 ? '#1a1917' : `rgba(249, 115, 22, ${0.2 + opacity * 0.8})`,
                      }}
                      title={`${data?.date}: ${count} reviews`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Difficult cards */}
        {leechCards.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-serif text-lg text-foreground mb-4">Cards to Work On</h2>
            <div className="space-y-3">
              {leechCards.map((card) => (
                <div key={card.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20 text-warning text-[10px] font-sans shrink-0 mt-0.5">
                    🔴 Difficult
                  </span>
                  <div>
                    <p className="font-sans text-sm text-foreground">{card.questionText}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">{card.sourceRef}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProgressPage;
