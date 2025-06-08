// Type declarations for external modules
declare module "geist/font/sans" {
  import type { NextFont } from "next/dist/compiled/@next/font";
  const font: NextFont;
  export default font;
}

declare module "geist/font/mono" {
  import type { NextFont } from "next/dist/compiled/@next/font";
  const font: NextFont;
  export default font;
}

declare module "next/font/google" {
  import type { NextFont } from "next/dist/compiled/@next/font";

  export interface GoogleFontOptions {
    weight?: string | string[];
    style?: string | string[];
    subsets?: string[];
    display?: "auto" | "block" | "swap" | "fallback" | "optional";
    preload?: boolean;
    variable?: string;
    fallback?: string[];
  }

  export function Instrument_Serif(options: GoogleFontOptions): NextFont;
}

declare module "@vercel/analytics/react" {
  export interface AnalyticsProps {
    mode?: "production" | "development";
    debug?: boolean;
    beforeSend?: (event: unknown) => unknown;
  }

  export function Analytics(props: AnalyticsProps): JSX.Element;
}
