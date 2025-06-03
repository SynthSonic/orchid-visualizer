import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Navigation from "./_components/Navigation";
import { Footer } from "./_components/Footer";

import { TRPCReactProvider } from "~/trpc/react";

// This font is used in global.css via its variable property
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head></head>
      <body className="flex min-h-screen flex-col bg-black text-white">
        {/* Custom styles are added in globals.css */}
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
