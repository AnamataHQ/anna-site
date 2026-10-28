import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SHARE_TITLE = 'Anna | Anamata';
const SHARE_DESCRIPTION =
  'Anna is the digital AI assistant from Anamata that finishes recurring administration in the systems your team already uses, in Teams or Slack, and asks when a decision is yours.';
// Rendered from design/share/anna-share.html; see design/share/README.md.
const SHARE_IMAGE = {
  url: '/share/anna-1200x630.png',
  width: 1200,
  height: 630,
  alt: 'Anna by Anamata',
};

// Preview builds point the card at production on purpose: the preview is
// password-protected, so no scraper can read it anyway. No alternate-language
// link: both languages are served from the same English HTML.
export const metadata: Metadata = {
  metadataBase: new URL('https://anna-site.anamata.ai'),
  title: SHARE_TITLE,
  description: SHARE_DESCRIPTION,
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Anamata',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: '/',
    locale: 'en_NL',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
