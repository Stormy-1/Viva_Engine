import { ReactNode } from 'react';

interface SessionLayoutProps {
  children: ReactNode;
}

const SessionLayout = ({ children }: SessionLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SessionLayout;
