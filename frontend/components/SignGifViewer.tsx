'use client';

import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, ImageOff, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AltSource {
  name: string;
  url: string;
  type: string;
}

interface SignGifData {
  word: string;
  gif_url: string | null;
  page_url: string;
  source: string;
  found: boolean;
  alt_sources: AltSource[];
  media_type: 'image' | 'video';
}

interface SignGifViewerProps {
  word?: string;
  autoLoad?: boolean;
  showSearch?: boolean;
  title?: string;
}

export function SignGifViewer({
  word: initialWord,
  autoLoad = true,
  showSearch = true,
  title = 'Sign Demonstration',
}: SignGifViewerProps) {
  const [searchWord, setSearchWord] = useState(initialWord || '');
  const [currentWord, setCurrentWord] = useState(initialWord || '');
  const [gifData, setGifData] = useState<SignGifData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const fetchGif = async (word: string) => {
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setImageError(false);
    setCurrentWord(word);

    try {
      const response = await fetch('/api/signs/gif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sign GIF');
      }

      const data = await response.json();
      setGifData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GIF');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialWord && autoLoad) {
      fetchGif(initialWord);
    }
  }, [initialWord, autoLoad]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGif(searchWord);
  };

  const handleRetry = () => {
    if (currentWord) {
      fetchGif(currentWord);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
        <h3 className="text-lg font-bold">{title}</h3>
        {gifData?.source && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800">
            via {gifData.source}
          </span>
        )}
      </div>
      <CardContent className="space-y-4 p-5">
        {/* Search Form */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a word to see sign..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!searchWord.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50/50 py-12 dark:bg-blue-500/5">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-slate-500">
              Searching for &quot;{currentWord}&quot;...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 py-8 dark:border-red-900/50 dark:bg-red-900/10">
            <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* GIF Display */}
        {gifData && !isLoading && !error && (
          <div className="space-y-4">
            {/* Media Display (Video or GIF) */}
            {gifData.found && gifData.gif_url && !imageError ? (
              <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                {gifData.media_type === 'video' ? (
                  <video
                    src={gifData.gif_url}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="mx-auto h-auto max-h-[400px] w-full object-contain"
                    onError={() => setImageError(true)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={gifData.gif_url}
                    alt={`ASL sign for ${gifData.word}`}
                    className="mx-auto h-auto max-h-[400px] w-full object-contain"
                    onError={() => setImageError(true)}
                  />
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm dark:bg-slate-800/90">
                  {gifData.media_type === 'video' && <Play className="h-3 w-3 text-blue-500" />}
                  Sign: &quot;{gifData.word}&quot;
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-12 dark:bg-slate-800/50">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
                  <ImageOff className="h-7 w-7 text-slate-400" />
                </div>
                <p className="font-medium text-slate-500">
                  No direct GIF found for &quot;{gifData.word}&quot;
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Try the links below to find demonstrations
                </p>
              </div>
            )}

            {/* Source Link */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-semibold">View on {gifData.source}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Full page with additional context
                </p>
              </div>
              <a
                href={gifData.page_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
              </a>
            </div>

            {/* Alternative Sources */}
            {gifData.alt_sources && gifData.alt_sources.length > 0 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold">More Resources:</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {gifData.alt_sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
                    >
                      {source.type === 'video_search' ? (
                        <Play className="h-4 w-4 text-red-500" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm font-medium">{source.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!gifData && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-12 dark:bg-slate-800/50">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
              <Play className="h-7 w-7 text-blue-500" />
            </div>
            <p className="font-medium text-slate-500">
              Enter a word above to see the sign demonstration
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
