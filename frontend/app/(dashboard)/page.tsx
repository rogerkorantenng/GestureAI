'use client';

import Link from 'next/link';
import { Languages, BookOpen, History, Flame, Trophy, Clock, Target, ArrowRight, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAnalyticsStore, useSessionStore } from '@/lib/store';

const quickActions = [
  {
    href: '/translate',
    label: 'Start Translating',
    description: 'Real-time sign language translation with audio',
    icon: Languages,
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/20',
  },
  {
    href: '/learn',
    label: 'Learn Signs',
    description: 'Visual step-by-step signing guides',
    icon: BookOpen,
    gradient: 'from-sky-500 to-cyan-500',
    shadow: 'shadow-sky-500/20',
  },
  {
    href: '/history',
    label: 'View History',
    description: 'Track your learning progress',
    icon: History,
    gradient: 'from-indigo-500 to-violet-500',
    shadow: 'shadow-indigo-500/20',
  },
];

export default function DashboardHome() {
  const { signsLearned, practiceMinutes, streakDays, points, activities } = useAnalyticsStore();
  const { session } = useSessionStore();

  const stats = [
    {
      label: 'Signs Learned',
      value: signsLearned,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'Practice Time',
      value: `${practiceMinutes}m`,
      icon: Clock,
      color: 'text-sky-500',
      bgColor: 'bg-sky-50 dark:bg-sky-500/10',
    },
    {
      label: 'Day Streak',
      value: streakDays,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
    },
    {
      label: 'Total Points',
      value: points,
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-4 sm:p-6">
        {/* Hero Banner */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-xl shadow-blue-500/20 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 text-xl font-bold sm:text-2xl">Live Sign Language Agent</h2>
              <p className="text-blue-100">Translate signs with voice, vision, and AI in real-time</p>
            </div>
            <Link href="/translate">
              <Button className="rounded-xl bg-white px-6 font-semibold text-blue-600 shadow-lg hover:bg-blue-50">
                <Mic className="mr-2 h-4 w-4" />
                Start Live Session
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-slate-100 dark:border-slate-800">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="cursor-pointer rounded-2xl border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-sm text-slate-400">{action.description}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Getting Started */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                    <History className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-400">No recent activity</p>
                  <p className="text-sm text-slate-300">Start translating or learning to see your progress!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                        activity.type === 'translation' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' :
                        activity.type === 'learning' ? 'bg-sky-50 text-sky-500 dark:bg-sky-500/10' :
                        'bg-violet-50 text-violet-500 dark:bg-violet-500/10'
                      }`}>
                        {activity.type === 'translation' ? (
                          <Languages className="h-4 w-4" />
                        ) : activity.type === 'learning' ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">{activity.text}</div>
                        {activity.details && (
                          <div className="text-xs text-slate-400">{activity.details}</div>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-500 dark:bg-blue-500/10">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium">Try live translation</div>
                  <div className="text-sm text-slate-400">
                    Camera + mic for real-time sign translation
                  </div>
                </div>
                <Link href="/translate">
                  <Button size="sm" className="rounded-lg bg-blue-500 hover:bg-blue-600">Start</Button>
                </Link>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sm font-bold text-sky-500 dark:bg-sky-500/10">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium">Learn common signs</div>
                  <div className="text-sm text-slate-400">
                    Step-by-step visual signing guides
                  </div>
                </div>
                <Link href="/learn">
                  <Button size="sm" variant="outline" className="rounded-lg">Learn</Button>
                </Link>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-500 dark:bg-indigo-500/10">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium">Track your progress</div>
                  <div className="text-sm text-slate-400">
                    Review learning history and stats
                  </div>
                </div>
                <Link href="/history">
                  <Button size="sm" variant="outline" className="rounded-lg">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
