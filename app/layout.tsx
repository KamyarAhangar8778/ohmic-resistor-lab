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
    <html lang="fa" dir="rtl">
      <head>
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
        {/* Instant pre-hydration ASCII line loader */}
        <div
          id="pre-hydration-loader"
          suppressHydrationWarning
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e4e4e7',
            fontFamily: 'monospace',
            fontSize: '32px',
            userSelect: 'none',
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <span id="pre-ascii-char">|</span>
              <script>
                (function() {
                  var f = ['|', '/', '-', '\\\\'];
                  var i = 0;
                  var el = document.getElementById('pre-ascii-char');
                  if (el) {
                    window.__asciiPreInterval = setInterval(function() {
                      i = (i + 1) & 3;
                      el.textContent = f[i];
                    }, 200);
                  }
                })();
              </script>
            `,
          }}
        />
        <InitialAppLoader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
