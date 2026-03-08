'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Waves, Home, Languages, BookOpen, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/lib/store';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/translate', label: 'Translate', icon: Languages },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, clearSession } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur-md dark:bg-slate-900/90 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Gesture<span className="text-blue-500">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r bg-white/95 backdrop-blur-md transition-transform duration-300 dark:bg-slate-900/95 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo - Desktop */}
        <div className="hidden h-16 items-center gap-2.5 border-b px-6 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Gesture<span className="text-blue-500">AI</span>
          </span>
        </div>

        {/* Logo - Mobile (spacing) */}
        <div className="h-16 lg:hidden" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-blue-500')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle - Desktop */}
        <div className="hidden border-t px-4 py-3 lg:block">
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* User Section */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-semibold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
              {session?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <div className="truncate text-sm font-medium">{session?.name || 'User'}</div>
              <div className="text-xs text-slate-400">Free Plan</div>
            </div>
          </div>
          <button
            onClick={clearSession}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
