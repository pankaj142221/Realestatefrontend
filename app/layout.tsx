import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: '--font-marathi'
});
const nunitoSans = Nunito_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-nunito-sans'
});

export const metadata: Metadata = {
  title: 'Digital Forms - Mahalaxmi Developers',
  description: 'Secure digital form management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${notoSansDevanagari.variable} ${nunitoSans.variable} font-sans antialiased bg-gray-50 text-slate-900`}>
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
