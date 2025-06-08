import "~/styles/globals.css";

// Font imports
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
// Font imports
import { Analytics } from "@vercel/analytics/react";
import Navigation from "./_components/Navigation";
import { Footer } from "./_components/Footer";

import { TRPCReactProvider } from "~/trpc/react";

/**
 * Font Configuration
 *
 * The app uses three main font families:
 * 1. Geist Sans - Primary sans-serif font for body text and general UI
 * 2. Geist Mono - Monospace font for navigation, code, and technical labels
 * 3. Instrument Serif - Serif font for keyboard display headers
 *
 * Each font is configured with CSS variables that can be accessed via:
 * - var(--font-geist-sans)
 * - var(--font-geist-mono)
 * - var(--font-instrument)
 *
 * Tailwind utility classes are available for consistent typography:
 * - text-body-1, text-body-1-emphasized - 16pt Geist Sans text
 * - text-body-2, text-body-2-emphasized - 14pt Geist Sans text (app default)
 * - text-keyboard-h1 - 44px Instrument Serif
 * - text-keyboard-label - 16px Geist Mono
 * - text-navigation - 17pt Geist Mono
 * - text-footer-body - 14pt Geist Sans
 * - text-footer-button - 12pt Geist Mono
 */

// Configure Instrument Serif font
// Using type assertion to ensure TypeScript recognizes the variable property
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

// GeistMono and GeistSans are imported from the geist package and include the variable property

export const metadata = {
  title: "Orchid Visualizer",
  description: "A piano learning app",
  metadataBase: new URL("https://orchid.synthsonic.app"),
  authors: [{ name: "Orchid" }],
  openGraph: {
    title: "Orchid Visualizer",
    description:
      "A tool to explore and understand the Telepathic Instruments Orchid with real-time chord analysis and voicing insights!",
    type: "website",
    siteName: "Orchid Visualizer",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchid Visualizer",
    description:
      "A tool to explore and understand the Telepathic Instruments Orchid with real-time chord analysis and voicing insights!",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#AD792A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${(GeistSans as any).variable} ${(GeistMono as any).variable} ${(instrumentSerif as any).variable}`}
      // Using any type assertion for font variables to bypass TypeScript checks
    >
      <head></head>
      <body className="flex min-h-screen flex-col bg-black text-white text-body-2">
        {/* Default font is text-body-2: Geist Sans 14pt Regular */}
        <TRPCReactProvider>
          <Navigation />
          <main className="flex-grow">{children}</main>
        </TRPCReactProvider>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
