'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { RotateCcw, Play, Pause, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { HandPose, DEFAULT_POSE, getPoseForSign, ASL_POSES } from '@/lib/handPoses';

// Dynamically import Hand3D to avoid SSR issues
const Hand3D = dynamic(
  () => import('@/components/Hand3D').then((mod) => mod.Hand3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-2xl bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-sm text-slate-400">Loading 3D viewer...</span>
        </div>
      </div>
    ),
  }
);

interface Hand3DViewerProps {
  word?: string;
  pose?: HandPose;
  title?: string;
  showLetterButtons?: boolean;
  showAIGenerate?: boolean;
}

export function Hand3DViewer({
  word,
  pose: externalPose,
  title = '3D Hand Visualization',
  showLetterButtons = true,
  showAIGenerate = true,
}: Hand3DViewerProps) {
  const [currentPose, setCurrentPose] = useState<HandPose>(DEFAULT_POSE);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [poseDescription, setPoseDescription] = useState<string | null>(null);

  useEffect(() => {
    if (externalPose) {
      setCurrentPose(externalPose);
    } else if (word) {
      // First try local poses
      const pose = getPoseForSign(word);
      if (pose) {
        setCurrentPose(pose);
      } else {
        // Fetch from AI
        fetchAIPose(word);
      }
    }
  }, [word, externalPose]);

  const fetchAIPose = async (sign: string) => {
    if (!sign.trim()) return;

    setIsLoadingAI(true);
    setPoseDescription(null);

    try {
      const response = await fetch('/api/signs/hand-pose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign, language: 'ASL' }),
      });

      if (response.ok) {
        const data = await response.json();
        // Convert API response to HandPose format
        const pose: HandPose = {
          thumb: data.pose.thumb,
          index: data.pose.index,
          middle: data.pose.middle,
          ring: data.pose.ring,
          pinky: data.pose.pinky,
          wristRotation: data.pose.wrist_rotation || { x: 0, y: 0, z: 0 },
          palmDirection: data.pose.palm_direction || 'forward',
        };
        setCurrentPose(pose);
        setPoseDescription(data.description);
      }
    } catch (error) {
      console.error('Failed to fetch AI pose:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim()) {
      setSelectedLetter(null);
      fetchAIPose(aiInput.trim());
    }
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    const pose = ASL_POSES[letter];
    if (pose) {
      setCurrentPose(pose);
    }
  };

  const handleReset = () => {
    setCurrentPose(DEFAULT_POSE);
    setSelectedLetter(null);
    setIsAnimating(false);
  };

  const alphabet = 'ABCDEFGHIKLORSUVWY'.split(''); // Letters we have poses for

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
          >
            {isAnimating ? (
              <>
                <Pause className="mr-1.5 h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-4 w-4" />
                Animate
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="overflow-hidden rounded-2xl">
          <Hand3D pose={currentPose} isAnimating={isAnimating} />
        </div>

        {selectedLetter && (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm dark:bg-blue-500/10">
              <span className="text-slate-500">Showing:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Letter {selectedLetter}</span>
            </span>
          </div>
        )}

        {word && !selectedLetter && (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm dark:bg-blue-500/10">
              <span className="text-slate-500">Sign for:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">&quot;{word}&quot;</span>
            </span>
          </div>
        )}

        {/* AI Pose Generation */}
        {showAIGenerate && (
          <form onSubmit={handleAIGenerate} className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
              <Input
                type="text"
                placeholder="Generate pose for any word..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!aiInput.trim() || isLoadingAI} size="sm">
              {isLoadingAI ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </form>
        )}

        {/* Pose Description */}
        {poseDescription && (
          <div className="rounded-2xl bg-blue-50/70 p-4 dark:bg-blue-500/10">
            <p className="text-sm text-slate-600 dark:text-slate-300">{poseDescription}</p>
          </div>
        )}

        {showLetterButtons && (
          <div>
            <p className="mb-2.5 text-sm font-medium text-slate-500">Try ASL Alphabet:</p>
            <div className="flex flex-wrap gap-1.5">
              {alphabet.map((letter) => (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Drag to rotate the hand view
        </p>
      </CardContent>
    </Card>
  );
}
