import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import DocumentCard from '@/components/DocumentCard';
import { mockDocuments, mockStats } from '@/lib/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Greeting card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                {greeting}, let's get to work. ☀️
              </h1>
              <p className="font-sans text-sm text-muted-foreground">
                You have <span className="text-foreground font-medium">{mockStats.cardsToday} cards</span> due today across 2 subjects
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1">~10 minutes</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                to="/session/daily"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
              >
                Start Daily Review <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">
                Review later
              </button>
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-foreground">Your Materials</h2>
          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-sans text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Upload New
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {mockDocuments.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <DocumentCard doc={doc} onStudy={() => navigate('/session/daily')} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
