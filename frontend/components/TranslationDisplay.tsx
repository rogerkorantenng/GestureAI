'use client';

import { useState } from 'react';
import { Volume2, Copy, Trash2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslationStore } from '@/lib/store';

export function TranslationDisplay() {
  const { translations, isTranslating, clearTranslations, mode } = useTranslationStore();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  if (mode === 'text-to-sign') {
    return <TextToSignDisplay />;
  }

  return (
    <Card className="h-[420px] overflow-hidden">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">Detected Signs</h3>
            {isTranslating && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-500/10">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                <span className="text-xs font-medium text-blue-500">Processing</span>
              </div>
            )}
          </div>
          {translations.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearTranslations} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Translations List */}
        <div className="flex-1 overflow-y-auto p-4">
          {translations.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-2xl">🤟</span>
                </div>
                <p className="mb-1 font-medium text-slate-400">No translations yet</p>
                <p className="text-sm text-slate-300">Start the camera and sign to see translations</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {translations.map((translation) => (
                <li
                  key={translation.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{translation.text}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                        <span>{translation.timestamp.toLocaleTimeString()}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                        <span className={`font-medium ${
                          translation.confidence > 0.8 ? 'text-emerald-500' :
                          translation.confidence > 0.5 ? 'text-amber-500' : 'text-red-400'
                        }`}>
                          {Math.round(translation.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-blue-500"
                        onClick={() => speakText(translation.text)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-blue-500"
                        onClick={() => copyToClipboard(translation.text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Combined Output */}
        {translations.length > 0 && (
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Combined
            </p>
            <p className="rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 p-3.5 text-lg font-semibold text-blue-700 dark:from-blue-500/10 dark:to-sky-500/10 dark:text-blue-300">
              {translations
                .slice()
                .reverse()
                .map((t) => t.text)
                .join(' ')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface SignStep {
  step: number;
  description: string;
  hand_position: string;
  movement?: string;
}

interface SignGuidance {
  steps: SignStep[];
  notes?: string;
}

function TextToSignDisplay() {
  const { currentText, setCurrentText } = useTranslationStore();
  const [guidance, setGuidance] = useState<SignGuidance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidance = async () => {
    if (!currentText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/signs/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, language: 'ASL' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get guidance');
      }

      const data = await response.json();
      setGuidance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[420px] overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <h3 className="font-bold">Text to Sign Language</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-2">
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Type text to see sign language guidance..."
              className="h-20 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  fetchGuidance();
                }
              }}
            />
          </div>

          <Button
            onClick={fetchGuidance}
            disabled={!currentText.trim() || isLoading}
            className="mt-3 w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting guidance...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Get Sign Language Guide
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {guidance && (
            <div className="mt-4 space-y-2.5">
              <p className="text-sm font-semibold text-slate-500">
                How to sign &quot;{currentText}&quot; in ASL:
              </p>

              {guidance.steps.map((step) => (
                <div key={step.step} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white shadow-sm shadow-blue-500/20">
                      {step.step}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{step.description}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        <span className="font-medium text-slate-500">Hand:</span> {step.hand_position}
                      </p>
                      {step.movement && (
                        <p className="text-sm text-slate-400">
                          <span className="font-medium text-slate-500">Move:</span> {step.movement}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {guidance.notes && (
                <div className="rounded-xl bg-blue-50 p-3.5 dark:bg-blue-500/10">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <span className="font-semibold">Tip:</span> {guidance.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
