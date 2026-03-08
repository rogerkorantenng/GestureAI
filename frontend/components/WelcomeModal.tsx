'use client';

import { useState, useEffect } from 'react';
import { Waves, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSessionStore } from '@/lib/store';

export function WelcomeModal() {
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { isOnboarded, createSession } = useSessionStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOnboarded) {
        setIsVisible(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOnboarded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createSession(name.trim());
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <Waves className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            Welcome to <span className="text-blue-500">GestureAI</span>
          </h2>
          <p className="text-slate-500">
            Real-time sign language translation powered by AI.
          </p>
        </div>

        {/* Name Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              What should we call you?
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-12 rounded-xl"
            />
          </div>

          <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700" disabled={!name.trim()}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <span className="text-lg">🤟</span>
            </div>
            <div>Live Translation</div>
          </div>
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <span className="text-lg">🎙️</span>
            </div>
            <div>Voice & Sign</div>
          </div>
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <span className="text-lg">📊</span>
            </div>
            <div>Track Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}
