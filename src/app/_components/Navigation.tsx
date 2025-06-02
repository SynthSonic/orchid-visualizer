"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

const Navigation = memo(() => {
  const pathname = usePathname();

  return (
    <>
      <nav className="inline-flex justify-center bg-[#222] rounded-b-[32px] p-[20px_24px] mx-auto">
        <div className="flex items-center">
          {/* Left side navigation links */}
          <div className="flex items-center sm:flex hidden">
            <Link href="/" passHref>
              <div className="flex justify-center items-center px-4 py-1 rounded-[24px] mx-3 transition-colors">
                <div className={`font-['Geist_Mono'] text-[17px] leading-normal tracking-[-0.51px] uppercase ${pathname === "/" ? "text-[#AD792A]" : "text-white hover:text-[#AD792A]"}`}>
                  Visualizer
                </div>
              </div>
            </Link>
            <Link href="/voicings" passHref>
              <div className="flex justify-center items-center px-4 py-1 rounded-[24px] mx-3 transition-colors">
                <div className={`font-['Geist_Mono'] text-[17px] leading-normal tracking-[-0.51px] uppercase ${pathname === "/voicings" ? "text-[#AD792A]" : "text-white hover:text-[#AD792A]"}`}>
                  Voicings
                </div>
              </div>
            </Link>
            <Link href="/resources" passHref>
              <div className="flex justify-center items-center px-4 py-1 rounded-[24px] mx-3 transition-colors">
                <div className={`font-['Geist_Mono'] text-[17px] leading-normal tracking-[-0.51px] uppercase ${pathname === "/resources" ? "text-[#AD792A]" : "text-white hover:text-[#AD792A]"}`}>
                  Resources
                </div>
              </div>
            </Link>
            {/* 24px spacer */}
            <div className="w-6"></div>
          </div>
          
          {/* Right side social links */}
          <div className="flex items-center">
            <a
              href="https://discord.gg/wNPUwDYvYr"
              className="flex justify-center items-center px-4 py-1 rounded-[24px] gap-2 mx-3 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Discord"
            >
              <div className="w-[16px] h-[16px] text-white hover:text-[#AD792A] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 3C12.5 2.5 11.4 2.2 10.3 2C10.2 2.3 10 2.6 9.9 2.9C8.7 2.7 7.5 2.7 6.3 2.9C6.2 2.6 6 2.3 5.9 2C4.8 2.2 3.7 2.5 2.7 3C0.7 6 0.2 8.9 0.5 11.8C1.7 12.7 3 13.3 4.4 13.8C4.7 13.4 5 12.9 5.2 12.4C4.8 12.2 4.3 12 3.9 11.8C4 11.7 4.1 11.6 4.2 11.5C5.4 12.1 6.8 12.4 8.1 12.4C9.4 12.4 10.8 12.1 12 11.5C12.1 11.6 12.2 11.7 12.3 11.8C11.9 12 11.4 12.2 11 12.4C11.2 12.9 11.5 13.4 11.8 13.8C13.2 13.3 14.5 12.7 15.7 11.8C16 8.5 15.2 5.6 13.5 3ZM5.3 10C4.6 10 4 9.3 4 8.5C4 7.7 4.6 7 5.3 7C6 7 6.6 7.7 6.6 8.5C6.6 9.3 6 10 5.3 10ZM10.9 10C10.2 10 9.6 9.3 9.6 8.5C9.6 7.7 10.2 7 10.9 7C11.6 7 12.2 7.7 12.2 8.5C12.2 9.3 11.6 10 10.9 10Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="font-['Geist_Mono'] text-[17px] leading-normal tracking-[-0.51px] uppercase text-white hover:text-[#AD792A] transition-colors sm:block hidden">
                Discord
              </div>
            </a>
            <a
              href="https://github.com/SynthSonic/orchid-visualizer"
              className="flex justify-center items-center px-4 py-1 rounded-[24px] gap-2 mx-3 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contribute on GitHub"
            >
              <div className="w-[16px] h-[16px] text-white hover:text-[#AD792A] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="font-['Geist_Mono'] text-[17px] leading-normal tracking-[-0.51px] uppercase text-white hover:text-[#AD792A] transition-colors sm:block hidden">
                GitHub
              </div>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
});

export default Navigation;
