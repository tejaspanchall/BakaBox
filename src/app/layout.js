import { Inter, Chivo } from 'next/font/google';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

const chivo = Chivo({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-chivo',
});

export const metadata = {
  title: 'BakaBox',
  description: 'Your one-stop destination for anime information',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={chivo.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}