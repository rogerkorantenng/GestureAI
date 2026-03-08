import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-16 lg:pl-64 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
