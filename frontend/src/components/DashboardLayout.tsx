import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, TrendingUp, Settings, Flame } from 'lucide-react';
import { mockStats } from '@/lib/mockData';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Library', path: '/dashboard' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] flex-col border-r border-border bg-card fixed h-full z-20">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl text-foreground">Viva Engine</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors duration-200 ${
                  isActive
                    ? 'bg-muted text-foreground border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <span className="font-sans font-semibold text-foreground text-sm">{mockStats.streak}-day streak</span>
          </div>
          <p className="text-xs text-muted-foreground font-sans">Keep it going!</p>
          <p className="text-xs text-muted-foreground font-mono mt-2">
            {mockStats.totalReviewed} reviewed · {mockStats.averageAccuracy}% accuracy
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-20 flex items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-serif text-lg text-foreground">Viva Engine</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          {navItems.slice(0, 3).map((item) => (
            <Link key={item.label} to={item.path} className="p-2 text-muted-foreground hover:text-foreground">
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-[260px] mt-14 md:mt-0">
        <div className="p-6 md:p-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
