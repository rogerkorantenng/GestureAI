'use client';

import { useState } from 'react';
import { Search, Loader2, BookOpen, Sparkles, GraduationCap, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardHeader } from '@/components/DashboardHeader';
import { VisualSignGuide, VisualSignGuideLoading } from '@/components/VisualSignGuide';
import { SignGifViewer } from '@/components/SignGifViewer';
import { useAnalyticsStore } from '@/lib/store';

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

const commonSigns = [
  'Hello',
  'Thank you',
  'Please',
  'Sorry',
  'Yes',
  'No',
  'Help',
  'I love you',
  'Good morning',
  'How are you',
  'My name is',
  'Nice to meet you',
];

export default function LearnPage() {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<VisualGuidance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addActivity, incrementSignsLearned, addPoints } = useAnalyticsStore();

  const fetchGuidance = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setGuidance(null);

    try {
      const response = await fetch('/api/signs/visual-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'ASL' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to get visual guidance');
      }

      setGuidance(data);

      // Track learning activity
      addActivity('learning', `Learned to sign: "${text}"`, `${data.steps.length} steps`);
      incrementSignsLearned();
      addPoints(25);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuidance(searchText);
  };

  const handleQuickSelect = (sign: string) => {
    setSearchText(sign);
    fetchGuidance(sign);
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Learn Signs" />

      <div className="p-6">
        {/* Search Form */}
        <Card className="mb-8">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Visual Sign Learning</h3>
                <p className="text-sm text-slate-400">AI-powered step-by-step sign language guides</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Enter a word or phrase to learn..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
              <Button type="submit" disabled={!searchText.trim() || isLoading} className="h-12 px-8">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Learn'
                )}
              </Button>
            </form>

            {/* Quick Select */}
            <div className="mt-5">
              <p className="mb-2.5 text-sm font-medium text-slate-500">Quick select common signs:</p>
              <div className="flex flex-wrap gap-2">
                {commonSigns.map((sign) => (
                  <Button
                    key={sign}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(sign)}
                    disabled={isLoading}
                    className="rounded-full"
                  >
                    {sign}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 dark:border-red-900/50">
            <CardContent className="p-5">
              <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-900/10">
                <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
                <p className="mt-1 text-sm text-red-500/70">
                  Make sure the backend server is running.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <VisualSignGuideLoading />
            </CardContent>
          </Card>
        )}

        {/* Visual Guide with GIF Demo */}
        {guidance && !isLoading && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* GIF Viewer */}
            <div className="lg:col-span-1">
              <SignGifViewer
                word={searchText}
                autoLoad={true}
                showSearch={false}
                title="Sign Demonstration"
              />
            </div>

            {/* Visual Guide */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <VisualSignGuide guidance={guidance} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State with GIF Search */}
        {!guidance && !isLoading && !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                  <GraduationCap className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Start Learning</h3>
                <p className="mx-auto max-w-md text-slate-500">
                  Enter a word or phrase above to get step-by-step visual instructions
                  for signing in ASL. You can also click on a common sign to get started.
                </p>
              </CardContent>
            </Card>

            {/* GIF Search */}
            <SignGifViewer
              title="Search Sign Demonstrations"
              autoLoad={false}
              showSearch={true}
            />
          </div>
        )}

        {/* Learning Resources */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold">External Resources</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'HandSpeak',
                url: 'https://www.handspeak.com',
                desc: 'Comprehensive ASL dictionary with video demonstrations',
              },
              {
                name: 'ASL University (Lifeprint)',
                url: 'https://www.lifeprint.com',
                desc: 'Free ASL lessons and resources by Dr. Bill Vicars',
              },
              {
                name: 'Signing Savvy',
                url: 'https://www.signingsavvy.com',
                desc: 'ASL sign language video dictionary with word-finding tools',
              },
            ].map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold">{resource.name}</h4>
                      <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-500" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {resource.desc}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
