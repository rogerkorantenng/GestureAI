import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GestureAI - Real-time Sign Language Live Agent',
  description:
    'Break communication barriers with AI-powered real-time sign language translation. Powered by Gemini Live API on Google Cloud.',
  keywords: ['sign language', 'translator', 'accessibility', 'AI', 'Gemini', 'Google Cloud', 'live agent', 'GestureAI'],
  authors: [{ name: 'GestureAI Team' }],
  openGraph: {
    title: 'GestureAI - Real-time Sign Language Live Agent',
    description: 'Break communication barriers with AI-powered real-time sign language translation.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
