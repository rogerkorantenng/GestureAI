'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Mic, MicOff, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslationStore } from '@/lib/store';

type SessionMode = 'live' | 'fallback';

export function VideoCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [sessionMode, setSessionMode] = useState<SessionMode>('live');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const { setIsTranslating, addTranslation } = useTranslationStore();

  const getWsUrl = useCallback((mode: SessionMode) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const wsBase = apiUrl.replace('http', 'ws');
    return mode === 'live'
      ? `${wsBase}/api/live/stream`
      : `${wsBase}/api/live/stream-fallback`;
  }, []);

  const connectWebSocket = useCallback((mode: SessionMode) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    const ws = new WebSocket(getWsUrl(mode));

    ws.onopen = () => {
      setConnectionStatus('connected');
      setError(null);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'translation':
          if (message.data?.text) {
            addTranslation(message.data.text, message.data.confidence || 0.8);
          }
          break;

        case 'audio':
          if (isAudioEnabled && message.data?.audio) {
            playAudio(message.data.audio, message.data.mime_type);
          }
          break;

        case 'sign_guidance':
          if (message.data) {
            addTranslation(
              `Sign: ${message.data.simplified_gloss || message.data.original_text}`,
              0.9
            );
          }
          break;

        case 'session_started':
          console.log('Live session started:', message.data?.message);
          break;

        case 'turn_complete':
          setIsTranslating(false);
          break;

        case 'interrupted':
          console.log('Agent response interrupted');
          break;

        case 'error':
          console.error('Live session error:', message.data?.error);
          // Fall back to standard API if Live API fails
          if (mode === 'live') {
            console.log('Falling back to standard API...');
            ws.close();
            setSessionMode('fallback');
            connectWebSocket('fallback');
          }
          break;
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    ws.onerror = () => {
      if (mode === 'live') {
        console.log('Live API connection failed, trying fallback...');
        setSessionMode('fallback');
        connectWebSocket('fallback');
      } else {
        setError('Unable to connect to server');
      }
    };

    wsRef.current = ws;

    // Ping to keep alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    ws.addEventListener('close', () => clearInterval(pingInterval));
  }, [getWsUrl, addTranslation, setIsTranslating, isAudioEnabled]);

  const playAudio = async (audioBase64: string, mimeType: string = 'audio/pcm;rate=24000') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;

      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

      // Handle PCM audio from Gemini Live API
      if (mimeType.includes('pcm')) {
        const float32 = new Float32Array(audioBytes.length / 2);
        const dataView = new DataView(audioBytes.buffer);
        for (let i = 0; i < float32.length; i++) {
          float32[i] = dataView.getInt16(i * 2, true) / 32768;
        }

        const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
        audioBuffer.copyToChannel(float32, 0);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        connectWebSocket(sessionMode);
      }
    } catch (err) {
      setError('Unable to access camera. Please grant permission.');
      console.error('Camera error:', err);
    }
  }, [connectWebSocket, sessionMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setIsTranslating(false);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopMic();
  }, [setIsTranslating]);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            wsRef.current?.send(JSON.stringify({
              type: 'audio',
              data: { audio: base64, mime_type: 'audio/webm;codecs=opus' },
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(1000); // Send chunks every second
      mediaRecorderRef.current = mediaRecorder;
      setIsMicOn(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Unable to access microphone.');
    }
  }, []);

  const stopMic = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }
    setIsMicOn(false);
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsTranslating(true);
      wsRef.current.send(JSON.stringify({
        type: 'frame',
        data: { image: imageData },
      }));
    } else {
      // Fallback to REST API
      try {
        setIsTranslating(true);
        const response = await fetch('/api/translate/frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.text) {
            addTranslation(data.text, data.confidence);
          }
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    }
  }, [isStreaming, setIsTranslating, addTranslation]);

  // Send interrupt when user clicks capture while agent is responding
  const handleInterrupt = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
    captureFrame();
  }, [captureFrame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStreaming) {
      interval = setInterval(captureFrame, 3000); // Capture every 3 seconds for real-time feel
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, captureFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          style={{ minHeight: '320px' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/95 dark:bg-slate-900/95">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                  <Camera className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-medium text-slate-500">Camera is off</p>
                <p className="mt-1 text-sm text-slate-400">Click start to begin live translation</p>
              </div>
            )}
          </div>
        )}

        {isStreaming && (
          <>
            {/* Live Badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-blue-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
              </span>
              Live
            </div>
            {/* Connection Status */}
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm dark:bg-slate-800/90">
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Connected</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Wifi className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Disconnected</span>
                </>
              )}
              {sessionMode === 'fallback' && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-700">fallback</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {!isStreaming ? (
          <Button onClick={startCamera} className="flex-1">
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button onClick={stopCamera} variant="destructive" className="flex-1">
              <CameraOff className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <Button onClick={handleInterrupt} variant="outline" title="Capture now" className="h-10 w-10 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={isMicOn ? stopMic : startMic}
              variant={isMicOn ? 'default' : 'outline'}
              title={isMicOn ? 'Stop microphone' : 'Start microphone (speech to sign)'}
              className="h-10 w-10 p-0"
            >
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              variant="outline"
              title={isAudioEnabled ? 'Mute audio output' : 'Enable audio output'}
              className="h-10 w-10 p-0"
            >
              {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
