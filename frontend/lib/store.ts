import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate UUID using Math.random (browser-compatible)
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export type TranslationMode = 'sign-to-text' | 'text-to-sign';

// Session types
interface UserSession {
  id: string;
  name: string;
  createdAt: string;
  lastVisit: string;
  preferences: {
    signLanguage: 'ASL' | 'BSL';
    theme: 'light' | 'dark' | 'system';
  };
}

interface SessionState {
  session: UserSession | null;
  isOnboarded: boolean;
  createSession: (name: string) => void;
  updateLastVisit: () => void;
  updatePreferences: (preferences: Partial<UserSession['preferences']>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      isOnboarded: false,

      createSession: (name: string) =>
        set({
          session: {
            id: generateUUID(),
            name,
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            preferences: {
              signLanguage: 'ASL',
              theme: 'system',
            },
          },
          isOnboarded: true,
        }),

      updateLastVisit: () =>
        set((state) => ({
          session: state.session
            ? { ...state.session, lastVisit: new Date().toISOString() }
            : null,
        })),

      updatePreferences: (preferences) =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                preferences: { ...state.session.preferences, ...preferences },
              }
            : null,
        })),

      clearSession: () => set({ session: null, isOnboarded: false }),
    }),
    {
      name: 'gestureai-session',
    }
  )
);

// Analytics types
interface ActivityItem {
  id: string;
  type: 'translation' | 'learning' | 'practice';
  text: string;
  timestamp: string;
  details?: string;
}

interface AnalyticsState {
  signsLearned: number;
  practiceMinutes: number;
  streakDays: number;
  points: number;
  activities: ActivityItem[];
  addActivity: (type: ActivityItem['type'], text: string, details?: string) => void;
  incrementSignsLearned: () => void;
  addPracticeMinutes: (minutes: number) => void;
  addPoints: (amount: number) => void;
  clearActivities: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      signsLearned: 0,
      practiceMinutes: 0,
      streakDays: 0,
      points: 0,
      activities: [],

      addActivity: (type, text, details) =>
        set((state) => ({
          activities: [
            {
              id: generateUUID(),
              type,
              text,
              timestamp: new Date().toISOString(),
              details,
            },
            ...state.activities.slice(0, 49),
          ],
        })),

      incrementSignsLearned: () =>
        set((state) => ({ signsLearned: state.signsLearned + 1 })),

      addPracticeMinutes: (minutes) =>
        set((state) => ({ practiceMinutes: state.practiceMinutes + minutes })),

      addPoints: (amount) =>
        set((state) => ({ points: state.points + amount })),

      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: 'gestureai-analytics',
    }
  )
);

interface Translation {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
}

interface TranslationState {
  mode: TranslationMode;
  isTranslating: boolean;
  translations: Translation[];
  currentText: string;
  setMode: (mode: TranslationMode) => void;
  setIsTranslating: (isTranslating: boolean) => void;
  addTranslation: (text: string, confidence: number) => void;
  setCurrentText: (text: string) => void;
  clearTranslations: () => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({
  mode: 'sign-to-text',
  isTranslating: false,
  translations: [],
  currentText: '',

  setMode: (mode) => set({ mode }),

  setIsTranslating: (isTranslating) => set({ isTranslating }),

  addTranslation: (text, confidence) =>
    set((state) => ({
      translations: [
        {
          id: generateUUID(),
          text,
          confidence,
          timestamp: new Date(),
        },
        ...state.translations.slice(0, 9),
      ],
    })),

  setCurrentText: (currentText) => set({ currentText }),

  clearTranslations: () => set({ translations: [] }),
}));
