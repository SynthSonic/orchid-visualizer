"use client";

/// <reference types="webmidi" />

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import type { NoteName, ChordInfo, MIDIMessage } from "./types/chord.types";
import {
  getMIDINoteName,
  getChordInfo,
  getColorBrightness,
  parseMIDIMessage,
} from "./chordUtils";

const BASE_CHORD_COLOR = "#8B5522"; // Rich brown color

// Colors for different states
const ACTIVE_STROKE_COLOR = "#FFFFFF"; // White stroke when MIDI is connected
const INACTIVE_STROKE_COLOR = "#555555"; // Gray stroke when no MIDI device is connected

const NOTES = [
  { note: "C" as NoteName, x: 0, isBlack: false },
  { note: "C#" as NoteName, x: 65, isBlack: true },
  { note: "D" as NoteName, x: 70, isBlack: false },
  { note: "D#" as NoteName, x: 135, isBlack: true },
  { note: "E" as NoteName, x: 140, isBlack: false },
  { note: "F" as NoteName, x: 210, isBlack: false },
  { note: "F#" as NoteName, x: 275, isBlack: true },
  { note: "G" as NoteName, x: 280, isBlack: false },
  { note: "G#" as NoteName, x: 345, isBlack: true },
  { note: "A" as NoteName, x: 350, isBlack: false },
  { note: "A#" as NoteName, x: 415, isBlack: true },
  { note: "B" as NoteName, x: 420, isBlack: false },
] as const;

// Component types
interface KeyProps {
  note: string;
  x: number;
  isBlack?: boolean;
  color?: string;
  displayText?: string;
  isBassNote?: boolean;
}

// Components
const Key: React.FC<KeyProps> = ({
  note: _note,
  x,
  isBlack = false,
  color,
  displayText,
  isBassNote = false,
}) => {
  const width = isBlack ? 40 : 65; // Black keys 40px wide as specified
  const height = isBlack ? 252 : 360; // White keys 360px, black keys 252px (increased by 24px)
  const adjustedX = isBlack ? x - width / 2 : x;
  const fill = color ?? "#000000"; // Black fill for all keys

  return (
    <g>
      {isBlack ? (
        <rect
          x={adjustedX}
          y={316}
          width={width}
          height={height}
          fill={fill}
          stroke="#FFFFFF"
          strokeWidth="1"
          rx={4}
          ry={4}
          className=""
        />
      ) : (
        // White keys: path with only top corners rounded (radius 6), bottom corners square
        <path
          d={`M${adjustedX + 6},340
              H${adjustedX + width - 6}
              Q${adjustedX + width},340 ${adjustedX + width},${340 + 6}
              V${340 + height}
              H${adjustedX}
              V${340 + 6}
              Q${adjustedX},340 ${adjustedX + 6},340
              Z`}
          fill={fill}
          stroke="#FFFFFF"
          strokeWidth="1"
          className=""
        />
      )}

      {/* Bass note indicator - black line at bottom with padding */}
      {isBassNote && (
        <line
          x1={adjustedX + 4} // 4px padding from left
          y1={isBlack ? height + 340 - 8 - 22 : height + 340 - 8} // Raise by 22px for black keys only
          x2={adjustedX + width - 4} // 4px padding from right
          y2={isBlack ? height + 340 - 8 - 22 : height + 340 - 8} // Raise by 22px for black keys only
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      )}

      {displayText && (
        <text
          x={adjustedX + width / 2}
          y={isBlack ? 316 + height - 14 : height + 340 - 20}
          textAnchor="middle"
          fill="#FFFFFF"
          {...getKeyboardLabelFontProps()}
          letterSpacing="-0.03em"
        >
          {displayText}
        </text>
      )}
    </g>
  );
};

interface DialProps {
  activeChordType?: string;
  hasSixth?: boolean;
  hasSeventh?: boolean;
  hasMajorSeventh?: boolean;
  hasNinth?: boolean;
  midiDevice: string;
}

// Memoized Dial component to prevent re-renders when only voicing changes
const DialComponent: React.FC<DialProps> = ({
  activeChordType,
  hasSixth = false,
  hasSeventh = false,
  hasMajorSeventh = false,
  hasNinth = false,
  midiDevice,
}) => {
  const size = 60;
  const centerX = -100; // Moved 20px to the left
  const centerY = 460; // Moved down by 80px to be below the horizontal line
  const buttonSize = 75;
  const buttonGap = 8;
  const buttonSpacingY = buttonSize + 8;
  const buttonStartX = centerX - size - (buttonSize * 4 + buttonGap * 3) - 40; // Adjusted to compensate for centerX change
  const buttonY = 484; // Moved down by 24px more (484 instead of 460)
  const labelY = buttonY - buttonSize / 2 + 28;

  const renderButtons = (labels: string[], yOffset: number) =>
    labels.map((label, index) => {
      // Default to false for active state if no chord info is available yet
      const isActive =
        (yOffset < 0 && label === activeChordType) || // Top row - chord types
        (yOffset > 0 && // Bottom row - extensions
          ((label === "6" && hasSixth) ||
            (label === "m7" && hasSeventh) ||
            (label === "M7" && hasMajorSeventh) ||
            (label === "9" && hasNinth)));

      return (
        <g key={label}>
          <rect
            x={buttonStartX + (buttonSize + buttonGap) * index}
            y={buttonY - buttonSize / 2 + yOffset}
            width={buttonSize}
            height={buttonSize}
            fill={isActive ? "#8B5522" : "#000000"}
            stroke="#FFFFFF"
            strokeWidth="1"
            rx="6"
          />
          {/* Always show labels when MIDI device is connected */}
          {midiDevice !== "No MIDI device connected" &&
            midiDevice !== "Browser not supported" && (
              <text
                x={buttonStartX + (buttonSize + buttonGap) * index + 12}
                y={labelY + yOffset}
                textAnchor="start"
                fill={isActive ? "white" : "#888888"}
                {...getKeyboardLabelFontProps()}
                letterSpacing="-0.03em"
              >
                {label}
              </text>
            )}
        </g>
      );
    });

  return (
    <g>
      {/* Always render buttons, but text labels are conditionally shown in renderButtons */}
      {renderButtons(["Dim", "Min", "Maj", "Sus"], -buttonSpacingY / 2)}
      {renderButtons(["6", "m7", "M7", "9"], buttonSpacingY / 2)}
      <circle
        cx={centerX}
        cy={centerY}
        r={size}
        fill="#000000"
        stroke="#FFFFFF"
        strokeWidth="1"
        className=""
      />
      <circle
        cx={centerX}
        cy={centerY + size + 50}
        r={size * 0.45}
        fill="#000000"
        stroke="#FFFFFF"
        strokeWidth="1"
        className=""
      />
    </g>
  );
};

// Memoize the Dial component with a custom comparison function
// that only triggers re-renders when chord type or extensions change
const Dial = memo(DialComponent, (prevProps, nextProps) => {
  // Return true if props are equal (no re-render needed)
  return (
    prevProps.activeChordType === nextProps.activeChordType &&
    prevProps.hasSixth === nextProps.hasSixth &&
    prevProps.hasSeventh === nextProps.hasSeventh &&
    prevProps.hasMajorSeventh === nextProps.hasMajorSeventh &&
    prevProps.hasNinth === nextProps.hasNinth &&
    prevProps.midiDevice === nextProps.midiDevice
  );
});

// Helper function to determine colors based on MIDI connection state
const getStrokeColor = (midiDevice: string) => {
  return midiDevice ? ACTIVE_STROKE_COLOR : INACTIVE_STROKE_COLOR;
};

// Helper functions for standardized font styling in SVG elements
const getKeyboardLabelFontProps = () => ({
  fontFamily: "var(--font-geist-mono)",
  fontWeight: "500",
  fontSize: "16",
  letterSpacing: "-0.03em",
});

const getKeyboardH1FontProps = () => ({
  fontFamily: "var(--font-instrument)",
  fontSize: "44",
});

export const PianoKeyboard: React.FC = () => {
  // Track notes for each channel separately using a ref instead of state
  const activeNotesRef = useRef<Record<number, Set<number>>>({
    1: new Set<number>(),
    2: new Set<number>(),
    3: new Set<number>(),
  });

  // Track the root note of the current chord
  const currentRootNoteRef = useRef<number | null>(null);

  const [keyColors, setKeyColors] = useState<Record<string, string>>({});
  const [midiDevice, setMidiDevice] = useState<string>(
    "No MIDI device connected",
  );
  const [noteDisplayText, setNoteDisplayText] = useState<
    Record<string, string>
  >({});
  const [bassNotes, setBassNotes] = useState<Set<string>>(new Set()); // Track bass note names
  const [chordInfo, setChordInfo] = useState<ChordInfo | null>(null);

  // Update keyboard display based on Channel 1 notes
  const updateKeyboardDisplay = useCallback((notes: number[]) => {
    const newDisplayText: Record<string, string> = {};
    const newColors: Record<string, string> = {};

    // Only show labels for active notes
    notes.forEach((note) => {
      const fullNoteName = getMIDINoteName(note);
      const baseNoteName = fullNoteName.slice(0, -1);
      newDisplayText[baseNoteName] = fullNoteName;
      newColors[baseNoteName] = getColorBrightness(note, BASE_CHORD_COLOR);
    });

    setNoteDisplayText(newDisplayText);
    setKeyColors(newColors);
  }, []);

  // Update bass notes display based on Channel 2 notes
  const updateBassNotesDisplay = useCallback((notes: number[]) => {
    const newBassNotes = new Set<string>();

    notes.forEach((note) => {
      const fullNoteName = getMIDINoteName(note);
      const baseNoteName = fullNoteName.slice(0, -1);
      newBassNotes.add(baseNoteName);
    });

    setBassNotes(newBassNotes);
  }, []);

  // Update chord info based on Channel 3 notes
  const updateChordInfo = useCallback((notes: number[]) => {
    setChordInfo(notes.length > 0 ? getChordInfo(notes) : null);
  }, []);

  const handleMIDINote = useCallback(
    (midiMessage: MIDIMessage) => {
      const isNoteOn = midiMessage.type === "note-on";
      const isNoteOff = midiMessage.type === "note-off";
      const noteNumber = midiMessage.noteNumber;
      const channel = midiMessage.channel;

      if (!noteNumber) return; // If there's no note number, we can't process it

      // Handle notes by channel
      const updatedNotes = { ...activeNotesRef.current };
      const channelNotes = new Set<number>(
        updatedNotes[channel] ?? new Set<number>(),
      );

      if (isNoteOn) {
        channelNotes.add(noteNumber);

        // If this is channel 3 and we don't have a root note yet, set it
        if (channel === 3 && currentRootNoteRef.current === null) {
          currentRootNoteRef.current = noteNumber;
        }
      } else if (isNoteOff) {
        channelNotes.delete(noteNumber);

        // If this is channel 3 and the note being released is the root note,
        // clear all notes and reset root note
        if (channel === 3 && noteNumber === currentRootNoteRef.current) {
          channelNotes.clear();
          currentRootNoteRef.current = null;
        }
      }

      updatedNotes[channel] = channelNotes;
      activeNotesRef.current = updatedNotes;

      // Update appropriate display based on channel
      if (channel === 1) {
        if (channelNotes.size === 0) {
          setKeyColors({});
          setNoteDisplayText({});
        } else {
          updateKeyboardDisplay(Array.from(channelNotes));
        }

        // Sort notes numerically before passing to chord detection
        const sortedNotes = Array.from(channelNotes).sort((a, b) => a - b);
        updateChordInfo(Array.from(sortedNotes));
      } else if (channel === 2) {
        updateBassNotesDisplay(Array.from(channelNotes));
      } else if (channel === 3) {
        // BUG: DISABLING USE OF CHANNEL 3 DUE TO ORCHID BUG
        // If all notes are cleared, reset the root note
        // if (channelNotes.size === 0) {
        //   currentRootNoteRef.current = null;
        // }
        // Sort notes numerically before passing to chord detection
        // const sortedNotes = Array.from(channelNotes).sort((a, b) => a - b);
        // updateChordInfo(sortedNotes);
      }
    },
    [updateKeyboardDisplay, updateBassNotesDisplay, updateChordInfo],
  );

  useEffect(() => {
    // Check if this is Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari || !("requestMIDIAccess" in navigator)) {
      console.log("Browser not supported detected");
      // Force immediate state update
      setMidiDevice("Browser not supported");
      return;
    }

    const handleMidiSuccess = (midiAccess: WebMidi.MIDIAccess) => {
      // Get all inputs
      const inputs = midiAccess.inputs.values();
      let deviceFound = false;

      // Setup message handlers for all inputs
      for (const input of inputs) {
        if (input?.name) {
          setMidiDevice(input.name);
          deviceFound = true;
        }

        // Setup a message handler for this input
        input.onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
          const midiMessage = parseMIDIMessage(
            event.data,
            event.timeStamp ?? performance.now(),
          );
          if (midiMessage) {
            handleMIDINote(midiMessage);
          }
        };
      }

      if (!deviceFound) {
        setMidiDevice("No MIDI device connected");
      }

      // Listen for state changes (device connect/disconnect)
      midiAccess.onstatechange = (event: WebMidi.MIDIConnectionEvent) => {
        if (event.port && event.port.type === "input") {
          // Re-scan MIDI devices when they change
          handleMidiSuccess(midiAccess);
        }
      };
    };

    // Request MIDI access
    (
      navigator as Navigator & {
        requestMIDIAccess(): Promise<WebMidi.MIDIAccess>;
      }
    )
      .requestMIDIAccess()
      .then(handleMidiSuccess)
      .catch((error) => {
        console.log("MIDI access error:", error);
        setMidiDevice("No MIDI access");
      });
  }, [handleMIDINote]);

  // Extract chord type from chordInfo and map it to button labels
  // No default active button, only set when chord info is available
  const activeChordType = chordInfo
    ? chordInfo.chordName
        .split(" ")[1]
        ?.replace("7th", "7")
        ?.replace("Major", "Maj")
        ?.replace("Minor", "Min")
        ?.replace("Diminished", "Dim")
        ?.replace("Dominant", "")
        ?.replace("Sus4", "Sus")
        ?.replace("Sus2", "Sus")
    : undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative overflow-hidden rounded-[64px] border-2 bg-black ${midiDevice === "No MIDI device connected" || midiDevice === "Browser not supported" ? "border-[#555555]" : "border-white"}`}
      >
        <svg
          width="1130"
          height="704"
          viewBox="-520 0 1040 700"
          className={
            midiDevice === "No MIDI device connected" ||
            midiDevice === "Browser not supported"
              ? "midi-disconnected"
              : ""
          }
        >
          {/* New top section with speaker cutout holes - increased height */}
          <path
            d="M-564 0 L564 0 L564 220 C564 192.918 546.272 149 506.632 149 C466.992 149 -462.701 149 -510.921 149 C-559.142 149 -564 203.198 -564 220 Z"
            fill="#A88B5E"
            stroke="white"
            strokeWidth="2"
          />

          {/* Speaker cutout holes - left side (scaled 16px taller, updated shape) */}
          <g transform="translate(-480, 26) scale(0.9)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <g key={i} transform={`translate(${i * 36}, -8) scale(1.1477)`}>
                <path
                  d="M20.3203 100.124C20.3203 100.163 20.2969 108.521 10.3203 108.521V106.521C14.6351 106.521 16.4723 104.776 17.3516 103.3C17.8297 102.497 18.0771 101.677 18.2021 101.047C18.2639 100.736 18.2935 100.482 18.3076 100.315C18.3147 100.233 18.318 100.172 18.3193 100.139C18.32 100.122 18.3203 100.112 18.3203 100.109V17.1436C18.3203 13.8256 17.5757 9.99058 16.0986 7.05957C14.6074 4.1005 12.6442 2.52119 10.3203 2.52148C8.00148 2.52191 6.03717 4.10957 4.54297 7.08105C3.06445 10.0214 2.32042 13.8572 2.32031 17.1436V100.109L2.32129 100.139C2.32262 100.172 2.32596 100.233 2.33301 100.315C2.34717 100.482 2.37673 100.736 2.43848 101.047C2.5635 101.677 2.81089 102.497 3.28906 103.3C4.16832 104.776 6.00552 106.521 10.3203 106.521V108.521L9.8584 108.516C0.343047 108.262 0.320366 100.162 0.320312 100.124V17.1436C0.320549 10.0769 3.48306 0.52238 10.3203 0.521484L10.6377 0.52832C17.2555 0.816347 20.3202 10.1283 20.3203 17.1436V100.124Z"
                  fill={
                    midiDevice === "No MIDI device connected" ||
                    midiDevice === "Browser not supported"
                      ? INACTIVE_STROKE_COLOR
                      : "white"
                  }
                  fillOpacity={
                    midiDevice === "No MIDI device connected" ||
                    midiDevice === "Browser not supported"
                      ? 0.3
                      : 0.5
                  }
                />
                <path
                  d="M6.32031 14.5215C6.32031 12.3123 8.11117 10.5215 10.3203 10.5215C12.5295 10.5215 14.3203 12.3123 14.3203 14.5215V98.5215C14.3203 100.731 12.5295 102.521 10.3203 102.521C8.11117 102.521 6.32031 100.731 6.32031 98.5215V14.5215Z"
                  fill="black"
                />
              </g>
            ))}
          </g>

          {/* Speaker cutout holes - right side (scaled 16px taller, updated shape) */}
          <g transform="translate(482, 26) scale(-0.9, 0.9)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <g key={i} transform={`translate(${i * 36}, -8) scale(1.1477)`}>
                <path
                  d="M20.3203 100.124C20.3203 100.163 20.2969 108.521 10.3203 108.521V106.521C14.6351 106.521 16.4723 104.776 17.3516 103.3C17.8297 102.497 18.0771 101.677 18.2021 101.047C18.2639 100.736 18.2935 100.482 18.3076 100.315C18.3147 100.233 18.318 100.172 18.3193 100.139C18.32 100.122 18.3203 100.112 18.3203 100.109V17.1436C18.3203 13.8256 17.5757 9.99058 16.0986 7.05957C14.6074 4.1005 12.6442 2.52119 10.3203 2.52148C8.00148 2.52191 6.03717 4.10957 4.54297 7.08105C3.06445 10.0214 2.32042 13.8572 2.32031 17.1436V100.109L2.32129 100.139C2.32262 100.172 2.32596 100.233 2.33301 100.315C2.34717 100.482 2.37673 100.736 2.43848 101.047C2.5635 101.677 2.81089 102.497 3.28906 103.3C4.16832 104.776 6.00552 106.521 10.3203 106.521V108.521L9.8584 108.516C0.343047 108.262 0.320366 100.162 0.320312 100.124V17.1436C0.320549 10.0769 3.48306 0.52238 10.3203 0.521484L10.6377 0.52832C17.2555 0.816347 20.3202 10.1283 20.3203 17.1436V100.124Z"
                  fill={
                    midiDevice === "No MIDI device connected" ||
                    midiDevice === "Browser not supported"
                      ? INACTIVE_STROKE_COLOR
                      : "white"
                  }
                  fillOpacity={
                    midiDevice === "No MIDI device connected" ||
                    midiDevice === "Browser not supported"
                      ? 0.3
                      : 0.5
                  }
                />
                <path
                  d="M6.32031 14.5215C6.32031 12.3123 8.11117 10.5215 10.3203 10.5215C12.5295 10.5215 14.3203 12.3123 14.3203 14.5215V98.5215C14.3203 100.731 12.5295 102.521 10.3203 102.521C8.11117 102.521 6.32031 100.731 6.32031 98.5215V14.5215Z"
                  fill="black"
                />
              </g>
            ))}
          </g>

          {/* Horizontal line across the top of the keyboard */}
          <line
            x1="-564"
            y1="340"
            x2="564"
            y2="340"
            stroke={getStrokeColor(midiDevice)}
            strokeWidth="1"
          />

          {/* Only show message when no MIDI device is connected */}
          {(midiDevice === "No MIDI device connected" ||
            midiDevice === "Browser not supported") && (
            <text
              x="0"
              y="252"
              textAnchor="start"
              fill="#FFFFFF"
              {...getKeyboardH1FontProps()}
              letterSpacing="-0.03em"
            >
              {midiDevice}
            </text>
          )}
          {/* Always render the Dial component with default values when no chord info is available */}
          <Dial
            activeChordType={activeChordType}
            hasSixth={chordInfo?.hasSixth}
            hasSeventh={chordInfo?.hasSeventh}
            hasMajorSeventh={chordInfo?.hasMajorSeventh}
            hasNinth={chordInfo?.hasNinth}
            midiDevice={midiDevice}
          />
          <g>
            {/* Labels - only displayed when MIDI device is connected */}
            {midiDevice !== "No MIDI device connected" &&
              midiDevice !== "Browser not supported" && (
                <>
                  <text
                    x="0"
                    y="270"
                    textAnchor="start"
                    fill="#888888"
                    {...getKeyboardLabelFontProps()}
                    letterSpacing="-0.03em"
                  >
                    CHORD
                  </text>
                  <text
                    x="180"
                    y="270"
                    textAnchor="start"
                    fill="#888888"
                    {...getKeyboardLabelFontProps()}
                    letterSpacing="-0.03em"
                  >
                    INVERSION
                  </text>
                  <text
                    x="360"
                    y="270"
                    textAnchor="start"
                    fill="#888888"
                    {...getKeyboardLabelFontProps()}
                    letterSpacing="-0.03em"
                  >
                    BASS
                  </text>
                </>
              )}

            {/* Chord values - only shown when chordInfo exists */}
            {chordInfo && (
              <>
                {/* Chord values - displayed on top with Instrument Serif */}
                <text
                  x="0"
                  y="240"
                  textAnchor="start"
                  fill="#FFFFFF"
                  {...getKeyboardH1FontProps()}
                  letterSpacing="-0.03em"
                >
                  {/* Split chord name into root note and chord type with same size but with spacing */}
                  {chordInfo.chordName.split(" ")[0]}
                  <tspan
                    fontSize="44" /* Same size as root note */
                    dy="0"
                    dx="10" /* Add 10px spacing between root note and chord type */
                  >
                    {chordInfo.chordName.split(" ").slice(1).join(" ")}
                  </tspan>
                  {(() => {
                    const extensionCount = [
                      chordInfo.hasSixth,
                      chordInfo.hasSeventh,
                      chordInfo.hasMajorSeventh,
                      chordInfo.hasNinth,
                    ].filter(Boolean).length;

                    if (extensionCount === 4)
                      return (
                        <tspan fontSize="30" dy="-15" dx="2">
                          WTF
                        </tspan>
                      );
                    if (extensionCount === 3)
                      return (
                        <tspan fontSize="30" dy="-15" dx="2">
                          JAZZ
                        </tspan>
                      );
                    if (extensionCount > 0) {
                      const extensions = [];
                      if (chordInfo.hasSixth) extensions.push("6");
                      if (chordInfo.hasSeventh) extensions.push("7");
                      if (chordInfo.hasMajorSeventh) extensions.push("M7");
                      if (chordInfo.hasNinth) extensions.push("9");
                      return (
                        <tspan fontSize="30" dy="-15" dx="2">
                          {extensions.join("")}
                        </tspan>
                      );
                    }
                    return null;
                  })()}
                </text>
                <text
                  x="180"
                  y="240"
                  textAnchor="start"
                  fill="#FFFFFF"
                  {...getKeyboardH1FontProps()}
                  letterSpacing="-0.03em"
                >
                  {chordInfo.inversion}
                </text>
                <text
                  x="360"
                  y="240"
                  textAnchor="start"
                  fill="#FFFFFF"
                  {...getKeyboardH1FontProps()}
                  letterSpacing="-0.03em"
                >
                  {chordInfo.bassNote}
                </text>
              </>
            )}
          </g>
          {NOTES.filter((note) => !note.isBlack).map((note) => (
            <Key
              key={note.note}
              {...note}
              color={keyColors[note.note]}
              displayText={noteDisplayText[note.note]}
              isBassNote={bassNotes.has(note.note)}
            />
          ))}
          {NOTES.filter((note) => note.isBlack).map((note) => (
            <Key
              key={note.note}
              {...note}
              color={keyColors[note.note]}
              displayText={noteDisplayText[note.note]}
              isBassNote={bassNotes.has(note.note)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
