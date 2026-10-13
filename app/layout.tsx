import type {Metadata} from 'next';
import './globals.css'; // Global styles with local bundled fonts
import { CustomCursor } from '@/components/custom-cursor';
import { InitialAppLoader } from '@/components/ui/initial-app-loader';

export const metadata: Metadata = {
  title: 'Ohmic - Parallel Resistor Lab',
  description: 'High-precision parallel resistor calculator with modern dark minimalist Park UI aesthetic.',
  openGraph: {
    title: 'Ohmic - Parallel Resistor Lab',
    description: 'High-precision parallel resistor calculator with modern dark minimalist Park UI aesthetic.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohmic - Parallel Resistor Lab',
    description: 'High-precision parallel resistor calculator with modern dark minimalist Park UI aesthetic.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Local bundled font preloads */}
        <link
          rel="preload"
          href="/fonts/vazirmatn-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/kodemono-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <InitialAppLoader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
