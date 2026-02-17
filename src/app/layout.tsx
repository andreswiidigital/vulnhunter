import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VulnHunter - Advanced Vulnerability Scanner & Exploitation Platform',
  description: 'Discover and exploit vulnerabilities in web applications with real-time attack simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-dark-200 text-white antialiased`}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #00ff41',
            },
          }}
        />
      </body>
    </html>
  );
}
