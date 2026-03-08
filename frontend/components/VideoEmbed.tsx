'use client';

import { ExternalLink, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoResource {
  title: string;
  url: string;
  source: string;
  thumbnail?: string;
}

interface VideoEmbedProps {
  resource: VideoResource;
}

export function VideoEmbed({ resource }: VideoEmbedProps) {
  const isYouTube = resource.url.includes('youtube.com') || resource.url.includes('youtu.be');

  // Extract YouTube video ID if applicable
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = isYouTube ? getYouTubeId(resource.url) : null;

  return (
    <Card className="overflow-hidden">
      {youtubeId ? (
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={resource.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Play className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium">{resource.title}</h4>
                <p className="text-xs text-slate-400">{resource.source}</p>
              </div>
            </div>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </Button>
            </a>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface VideoResourceListProps {
  resources: VideoResource[];
}

export function VideoResourceList({ resources }: VideoResourceListProps) {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold">Video Resources</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map((resource, index) => (
          <VideoEmbed key={index} resource={resource} />
        ))}
      </div>
    </div>
  );
}
