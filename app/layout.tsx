import type {Metadata} from 'next';
import localFont from 'next/font/local';
import './globals.css'; // Global styles with local bundled fonts
import { CustomCursor } from '@/components/custom-cursor';
import { InitialAppLoader } from '@/components/ui/initial-app-loader';

const vazirmatn = localFont({
  src: [
    { path: '../public/fonts/vazirmatn-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/vazirmatn-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/vazirmatn-600.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/vazirmatn-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
});

const kodeMono = localFont({
  src: [
    { path: '../public/fonts/kodemono-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/kodemono-600.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/kodemono-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-kodemono',
  display: 'swap',
});

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
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${kodeMono.variable}`}>
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
