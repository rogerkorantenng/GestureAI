'use client';

import { VideoCapture } from '@/components/VideoCapture';
import { TranslationDisplay } from '@/components/TranslationDisplay';
import { ModeToggle } from '@/components/ModeToggle';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAnalyticsStore, useTranslationStore } from '@/lib/store';
import { useEffect, useRef } from 'react';

export default function TranslatePage() {
  const { addActivity, incrementSignsLearned, addPoints } = useAnalyticsStore();
  const { translations } = useTranslationStore();
  const lastTranslationCount = useRef(translations.length);

  useEffect(() => {
    if (translations.length > lastTranslationCount.current) {
      const latestTranslation = translations[0];
      if (latestTranslation) {
        addActivity('translation', `Translated: "${latestTranslation.text}"`,
          `${Math.round(latestTranslation.confidence * 100)}% confidence`
        );
        incrementSignsLearned();
        addPoints(10);
      }
    }
    lastTranslationCount.current = translations.length;
  }, [translations, addActivity, incrementSignsLearned, addPoints]);

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Translate" />

      <div className="p-4 sm:p-6">
        {/* Mode Toggle */}
        <ModeToggle />

        {/* Main Translation Interface */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Camera Feed</h2>
            <VideoCapture />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold">Translation</h2>
            <TranslationDisplay />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
          <h3 className="mb-3 font-bold text-blue-900 dark:text-blue-300">Tips for Better Translation</h3>
          <ul className="grid gap-3 text-sm text-blue-700 dark:text-blue-400 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">1</span>
              Ensure good lighting on your hands
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">2</span>
              Position hands clearly in frame
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">3</span>
              Make signs slowly and clearly
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">4</span>
              Use a plain background
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
