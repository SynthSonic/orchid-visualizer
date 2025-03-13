import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Old_Standard_TT } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

const oldStandardTT = Old_Standard_TT({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-old-standard',
});

export const metadata: Metadata = {
  title: "Orchid Voicing Viewer",
  description: "An interactive MIDI piano keyboard for exploring chord voicings and harmonies. Connect your MIDI device and start playing!",
  metadataBase: new URL('https://orchid-voicing.vercel.app'),
  authors: [{ name: 'Orchid' }],
  openGraph: {
    title: 'Orchid Voicing Viewer',
    description: 'An interactive MIDI piano keyboard for exploring chord voicings and harmonies. Connect your MIDI device and start playing!',
    type: 'website',
    siteName: 'Orchid Voicing Viewer',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orchid Voicing Viewer',
    description: 'An interactive MIDI piano keyboard for exploring chord voicings and harmonies. Connect your MIDI device and start playing!',
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1a1a1a',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${oldStandardTT.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
