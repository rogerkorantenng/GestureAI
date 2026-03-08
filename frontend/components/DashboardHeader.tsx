'use client';

import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/lib/store';

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { session } = useSessionStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md dark:bg-slate-900/80 sm:px-6">
      <div className="min-w-0 flex-1">
        {title ? (
          <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
        ) : (
          <div>
            <h1 className="truncate text-lg font-bold sm:text-xl">
              {getGreeting()}, {session?.name || 'there'}!
            </h1>
            <p className="hidden text-sm text-slate-400 sm:block">
              Ready to break communication barriers?
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search - Desktop only */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search signs..." className="w-64 rounded-xl border-slate-200 bg-slate-50 pl-9 dark:border-slate-700 dark:bg-slate-800" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
          <Bell className="h-5 w-5 text-slate-400" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </Button>

        {/* User Avatar - Desktop only */}
        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/25 sm:flex">
          {session?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
