"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export const Footer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Only show the Problems button on the main visualizer page
  const showProblemsButton = pathname === "/";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Add extra padding on all pages except the main visualizer page
  const extraPadding = pathname !== "/";

  return (
    <footer
      className={`flex items-center justify-between p-4 ${extraPadding ? "pb-10" : "pb-6"}`}
    >
      {/* Left side - Troubleshooting button (only on main visualizer page) */}
      <div className="relative">
        {showProblemsButton ? (
          <button
            ref={buttonRef}
            onClick={() => setIsExpanded(!isExpanded)}
            className="whitespace-nowrap rounded-lg bg-zinc-800 px-3 py-2 text-center font-['Geist'] text-xs font-medium uppercase text-[#979797]"
          >
            Problems?
          </button>
        ) : (
          <div className="w-[86px]"></div>
        )}

        {isExpanded && (
          <div
            ref={popupRef}
            className="absolute bottom-12 left-0 w-[400px] rounded-lg border border-zinc-700 bg-zinc-800 p-4 shadow-lg"
          >
            <div className="text-sm text-zinc-300">
              If MIDI notes aren&apos;t appearing, try these steps:
              <ol className="ml-5 mt-1 list-decimal space-y-1 pt-4">
                <li>Check that your MIDI device is connected and powered on</li>
                <li>
                  Ensure your browser has permission to access MIDI devices
                </li>
                <li>
                  If you&apos;re still having issues, check our troubleshooting
                  guide
                </li>
                <li>Try refreshing the page or using a different USB port</li>
                <li>
                  Some browsers (like Firefox) don&apos;t support WebMIDI, try
                  Chrome or Edge
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Center - Credit text */}
      <div className="absolute left-1/2 -translate-x-1/2 transform text-center font-['Geist'] text-sm text-[#5F5F63]">
        Created by enthusiasts, not by Telepathic Instruments.
      </div>

      {/* Right side - Empty for balance */}
      <div className="w-[120px]"></div>
    </footer>
  );
};
