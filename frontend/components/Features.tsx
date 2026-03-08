import { Zap, Globe, Shield, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Real-time Translation',
    description: 'Instant sign language recognition with live audio output powered by Gemini.',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Voice & Sign',
    description: 'Bidirectional: sign to speech and speech to sign guidance in real-time.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Privacy First',
    description: 'All processing happens in real-time. No data is stored or recorded.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Live Agent',
    description: 'Handles interruptions naturally, just like a real interpreter would.',
  },
];

export function Features() {
  return (
    <section id="features" className="mt-16 py-8">
      <h2 className="mb-2 text-center text-3xl font-bold">Features</h2>
      <p className="mb-8 text-center text-slate-500">Everything you need to bridge communication</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="rounded-2xl border-slate-100 p-6 transition-shadow hover:shadow-lg dark:border-slate-800">
            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-500 dark:bg-blue-500/10">
              {feature.icon}
            </div>
            <h3 className="mb-2 font-semibold">{feature.title}</h3>
            <p className="text-sm text-slate-500">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
