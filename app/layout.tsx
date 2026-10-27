import type { Metadata, Viewport } from 'next';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Timbangan Nasi',
  description: 'Catat berat nasi per krat, kelompokkan per batch, dan kirim rekapnya lewat WhatsApp.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
