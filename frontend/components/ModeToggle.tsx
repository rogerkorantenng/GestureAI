'use client';

import { Hand, MessageSquare } from 'lucide-react';
import { useTranslationStore, TranslationMode } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ModeToggle() {
  const { mode, setMode } = useTranslationStore();

  const modes: { value: TranslationMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'sign-to-text',
      label: 'Sign to Text',
      icon: <Hand className="h-5 w-5" />,
      description: 'Translate sign language to text',
    },
    {
      value: 'text-to-sign',
      label: 'Text to Sign',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Learn how to sign text',
    },
  ];

  return (
    <div className="mb-6 flex justify-center sm:mb-8">
      <div className="inline-flex w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50 sm:w-auto">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:flex-none sm:px-6 sm:py-3',
              mode === m.value
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
