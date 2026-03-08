'use client';

import { Waves } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md dark:bg-slate-900/90">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Gesture<span className="text-blue-500">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            About
          </Link>
          <a
            href="https://github.com/yourusername/gestureai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
