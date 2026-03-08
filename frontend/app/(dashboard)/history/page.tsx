'use client';

import { Languages, BookOpen, Target, Trash2, Calendar, Clock, Trophy, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAnalyticsStore } from '@/lib/store';

export default function HistoryPage() {
  const { activities, clearActivities, signsLearned, practiceMinutes, points } = useAnalyticsStore();

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = formatDate(activity.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'translation':
        return <Languages className="h-4 w-4" />;
      case 'learning':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'translation':
        return 'bg-blue-50 text-blue-500 dark:bg-blue-500/10';
      case 'learning':
        return 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10';
      default:
        return 'bg-violet-50 text-violet-500 dark:bg-violet-500/10';
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader title="History" />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{signsLearned}</div>
                  <div className="text-sm text-slate-400">Signs Learned</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <Clock className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{practiceMinutes}m</div>
                  <div className="text-sm text-slate-400">Practice Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{points}</div>
                  <div className="text-sm text-slate-400">Points Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <h3 className="text-lg font-bold">Activity Timeline</h3>
            {activities.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearActivities} className="text-slate-400 hover:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <CardContent className="p-5">
            {activities.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="mb-2 font-bold">No Activity Yet</h3>
                <p className="text-sm text-slate-400">
                  Start translating or learning signs to see your activity history here.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                  <div key={date}>
                    <div className="mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-semibold text-slate-500">{date}</span>
                    </div>
                    <div className="space-y-2.5 pl-6">
                      {dateActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{activity.text}</div>
                            {activity.details && (
                              <div className="mt-0.5 text-sm text-slate-400">{activity.details}</div>
                            )}
                          </div>
                          <div className="text-sm text-slate-400">
                            {formatTime(activity.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
