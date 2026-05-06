import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'MediCare | Your Health, Everywhere',
  description: 'AI-powered personal health management for everyone, everywhere.',
  keywords: 'health, medical, AI, symptoms, wellness, Medicare',
  authors: [{ name: 'MediCare Team' }],
  openGraph: {
    title: 'MediCare | Your Health, Everywhere',
    description: 'AI-powered personal health management platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
