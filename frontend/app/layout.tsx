import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Samarth Dental Care — Vijapur, Mehsana',
  description: 'Professional dental care in Vijapur, Mehsana, Gujarat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const phone = process.env.NEXT_PUBLIC_CLINIC_PHONE || '919408040219';

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          .whatsapp-float {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #25D366;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(37,211,102,0.45);
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
          }
          .whatsapp-float:hover {
            transform: scale(1.12);
            box-shadow: 0 6px 28px rgba(37,211,102,0.6);
          }
        `}</style>
      </head>
      <body className="font-body antialiased">
        {children}

        {/* Floating WhatsApp Button — har page pe */}
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Chat on WhatsApp"
          className="whatsapp-float"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.43.638 4.71 1.752 6.688L2 30l7.5-1.727A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.812-1.582l-.416-.247-4.453 1.025 1.056-4.326-.272-.444A11.46 11.46 0 014.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.372c-.344-.172-2.037-1.004-2.352-1.118-.315-.115-.545-.172-.774.172-.23.344-.888 1.118-1.089 1.348-.2.23-.401.258-.745.086-.344-.172-1.452-.535-2.767-1.707-1.022-.912-1.713-2.038-1.913-2.382-.2-.344-.021-.53.15-.701.155-.155.344-.401.516-.602.172-.2.23-.344.344-.573.115-.23.057-.43-.029-.602-.086-.172-.774-1.865-1.06-2.554-.28-.672-.563-.58-.774-.591l-.659-.011c-.23 0-.602.086-.916.43-.315.344-1.203 1.175-1.203 2.868s1.232 3.328 1.403 3.557c.172.23 2.426 3.703 5.878 5.192.822.355 1.463.567 1.963.725.824.263 1.574.226 2.167.137.66-.099 2.037-.832 2.323-1.636.287-.803.287-1.491.2-1.636-.086-.143-.315-.229-.659-.401z"/>
          </svg>
        </a>

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
