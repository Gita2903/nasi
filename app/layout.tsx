import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Timbangan Nasi Krat - Glassmorphism iOS',
  description: 'Aplikasi pencatatan dan riwayat timbangan nasi per krat praktis bergaya glassmorphism iOS.',
  openGraph: {
    title: 'Timbangan Nasi Krat - Glassmorphism iOS',
    description: 'Aplikasi pencatatan dan riwayat timbangan nasi per krat praktis bergaya glassmorphism iOS.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timbangan Nasi Krat - Glassmorphism iOS',
    description: 'Aplikasi pencatatan dan riwayat timbangan nasi per krat praktis bergaya glassmorphism iOS.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-sky-500/30 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
