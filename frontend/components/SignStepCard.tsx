'use client';

import { Hand, MoveRight, MapPin, Smile, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface SignStepCardProps {
  step: VisualSignStep;
  isActive?: boolean;
}

export function SignStepCard({ step, isActive = false }: SignStepCardProps) {
  const searchYouTube = () => {
    const query = encodeURIComponent(step.video_search_query);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  return (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/5' : ''}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white shadow-md shadow-blue-500/20">
              {step.step}
            </span>
            <div>
              <h4 className="text-lg font-bold">&quot;{step.word}&quot;</h4>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={searchYouTube}>
            <Search className="mr-2 h-4 w-4" />
            Video
          </Button>
        </div>

        {/* Description */}
        <p className="mb-5 leading-relaxed text-slate-500">{step.description}</p>

        {/* Visual Details Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl bg-blue-50/70 p-3.5 dark:bg-blue-500/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <Hand className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Hand Shape</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{step.hand_shape}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-sky-50/70 p-3.5 dark:bg-sky-500/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/20">
              <MoveRight className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-sky-400">Palm Faces</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{step.palm_orientation}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-violet-50/70 p-3.5 dark:bg-violet-500/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
              <MapPin className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-violet-400">Location</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{step.location}</div>
            </div>
          </div>

          {step.movement && (
            <div className="flex items-start gap-3 rounded-xl bg-indigo-50/70 p-3.5 dark:bg-indigo-500/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <MoveRight className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Movement</div>
                <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{step.movement}</div>
              </div>
            </div>
          )}

          {step.facial_expression && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50/70 p-3.5 dark:bg-amber-500/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Smile className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Expression</div>
                <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{step.facial_expression}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
