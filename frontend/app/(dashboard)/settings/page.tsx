'use client';

import { useState } from 'react';
import { User, Globe, Palette, Bell, Shield, Save, Check, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useSessionStore, useAnalyticsStore } from '@/lib/store';

export default function SettingsPage() {
  const { session, updatePreferences, clearSession } = useSessionStore();
  const { clearActivities } = useAnalyticsStore();
  const [name, setName] = useState(session?.name || '');
  const [saved, setSaved] = useState(false);

  const handleSaveName = () => {
    if (session && name.trim()) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLanguageChange = (language: 'ASL' | 'BSL') => {
    updatePreferences({ signLanguage: language });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme });
  };

  const handleResetData = () => {
    clearActivities();
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Settings" />

      <div className="mx-auto max-w-2xl p-6 space-y-5">
        {/* Profile Settings */}
        <Card>
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold">Profile</h3>
                <p className="text-sm text-slate-400">Manage your account settings</p>
              </div>
            </div>
          </div>
          <CardContent className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Display Name</label>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
                <Button onClick={handleSaveName} disabled={!name.trim()} className="shrink-0">
                  {saved ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">Member Since</label>
              <p className="text-sm text-slate-400">
                {session?.createdAt
                  ? new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Globe className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold">Sign Language</h3>
                <p className="text-sm text-slate-400">Choose your preferred sign language</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex gap-2">
              <Button
                variant={session?.preferences?.signLanguage === 'ASL' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('ASL')}
                className="flex-1"
              >
                ASL (American)
              </Button>
              <Button
                variant={session?.preferences?.signLanguage === 'BSL' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('BSL')}
                className="flex-1"
              >
                BSL (British)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                <Palette className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-bold">Appearance</h3>
                <p className="text-sm text-slate-400">Customize the look and feel</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <Button
                  key={theme}
                  variant={session?.preferences?.theme === theme ? 'default' : 'outline'}
                  onClick={() => handleThemeChange(theme)}
                  className="flex-1 capitalize"
                >
                  {theme}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold">Notifications</h3>
                <p className="text-sm text-slate-400">Configure notification preferences</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <div className="font-semibold">Learning Reminders</div>
                  <div className="mt-0.5 text-sm text-slate-400">
                    Get reminded to practice daily
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <div className="font-semibold">Progress Updates</div>
                  <div className="mt-0.5 text-sm text-slate-400">
                    Weekly summary of your progress
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold">Privacy & Data</h3>
                <p className="text-sm text-slate-400">Manage your data and privacy</p>
              </div>
            </div>
          </div>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <div className="font-semibold">Clear Activity History</div>
                <div className="mt-0.5 text-sm text-slate-400">
                  Remove all your learning and translation history
                </div>
              </div>
              <Button variant="outline" onClick={handleResetData}>
                Clear
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
              <div>
                <div className="font-semibold text-red-600 dark:text-red-400">Sign Out</div>
                <div className="mt-0.5 text-sm text-slate-400">
                  Clear session and all local data
                </div>
              </div>
              <Button variant="destructive" onClick={clearSession}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
