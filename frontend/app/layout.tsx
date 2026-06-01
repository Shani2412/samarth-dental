import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Samarth Dental Care — Vijapur, Mehsana',
  description: 'Professional dental care in Vijapur, Mehsana, Gujarat',
  icons: {
    icon:  '/logo.png',   // browser tab favicon
    apple: '/logo.png',   // iOS home screen icon
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: '#1A202C', color: '#fff', borderRadius: '50px', fontSize: '14px' },
            success: { iconTheme: { primary: '#0B6E68', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}