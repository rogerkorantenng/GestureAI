'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SignStepCard } from '@/components/SignStepCard';
import { VideoResourceList } from '@/components/VideoEmbed';

interface VisualSignStep {
  step: number;
  word: string;
  description: string;
  hand_shape: string;
  palm_orientation: string;
  location: string;
  movement?: string;
  facial_expression?: string;
  video_search_query: string;
}

interface VideoResource {
  title: string;
  url: string;
  source: string;
  thumbnail?: string;
}

interface VisualGuidance {
  text: string;
  language: string;
  steps: VisualSignStep[];
  video_resources: VideoResource[];
  tips?: string;
  common_mistakes?: string;
}

interface VisualSignGuideProps {
  guidance: VisualGuidance;
}

export function VisualSignGuide({ guidance }: VisualSignGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToPrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentStep((prev) => Math.min(guidance.steps.length - 1, prev + 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            How to sign &quot;{guidance.text}&quot;
          </h2>
          <p className="text-sm text-slate-400">
            {guidance.steps.length} step{guidance.steps.length !== 1 ? 's' : ''} in {guidance.language}
          </p>
        </div>
        {guidance.steps.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              disabled={currentStep === 0}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[4rem] text-center text-sm font-medium text-slate-400">
              {currentStep + 1} / {guidance.steps.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              disabled={currentStep === guidance.steps.length - 1}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Step Navigation Dots */}
      {guidance.steps.length > 1 && (
        <div className="flex justify-center gap-2">
          {guidance.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-500'
                  : 'w-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Current Step Card */}
      {guidance.steps[currentStep] && (
        <SignStepCard step={guidance.steps[currentStep]} isActive />
      )}

      {/* Tips and Common Mistakes */}
      <div className="grid gap-4 sm:grid-cols-2">
        {guidance.tips && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-200">Tips</h4>
                <p className="mt-1 text-sm leading-relaxed text-emerald-700 dark:text-emerald-300">{guidance.tips}</p>
              </div>
            </div>
          </div>
        )}

        {guidance.common_mistakes && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-200">Common Mistakes</h4>
                <p className="mt-1 text-sm leading-relaxed text-amber-700 dark:text-amber-300">{guidance.common_mistakes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Resources */}
      <VideoResourceList resources={guidance.video_resources} />

      {/* All Steps Overview */}
      {guidance.steps.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-bold">All Steps</h3>
          <div className="grid gap-2">
            {guidance.steps.map((step, index) => (
              <button
                key={step.step}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  index === currentStep
                    ? 'border-blue-200 bg-blue-50/50 shadow-sm dark:border-blue-800 dark:bg-blue-500/10'
                    : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                  index === currentStep
                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}>
                  {step.step}
                </span>
                <span className="font-semibold">&quot;{step.word}&quot;</span>
                <span className="flex-1 truncate text-sm text-slate-400">
                  {step.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VisualSignGuideLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
      <p className="font-medium text-slate-400">Generating visual guide...</p>
    </div>
  );
}
