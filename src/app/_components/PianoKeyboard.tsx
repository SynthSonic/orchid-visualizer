"use client";

/// <reference types="webmidi" />

import { useState, useEffect, useCallback, useRef } from "react";
import type { NoteName, ChordInfo, MIDIMessage } from "./types/chord.types";
import {
  getMIDINoteName,
  getChordInfo,
  getColorBrightness,
  parseMIDIMessage,
} from "./chordUtils";

const BASE_CHORD_COLOR = "#8B4513"; // Darker saddle brown color
const BASS_LINE_COLOR = "#000000"; // Black for bass note line

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
  const width = isBlack ? 39 : 65; // 39 is 60% of 65
  const height = isBlack ? 150 : 256;
  const adjustedX = isBlack ? x - width / 2 : x;
  const fill = color ?? (isBlack ? "#111" : "#1a1a1a");

  return (
    <g>
      <rect
        x={adjustedX}
        y={0}
        width={width}
        height={height}
        fill={fill}
        stroke="#000"
        strokeWidth="1"
        rx={isBlack ? 4 : 6}
        className={`cursor-pointer ${color ? "" : isBlack ? "hover:fill-neutral-900" : "hover:fill-neutral-800"}`}
      />

      {/* Bass note indicator - black line at bottom with padding */}
      {isBassNote && (
        <line
          x1={adjustedX + 4} // 4px padding from left
          y1={height - 8} // 8px padding from bottom
          x2={adjustedX + width - 4} // 4px padding from right
          y2={height - 8} // 8px padding from bottom
          stroke={BASS_LINE_COLOR}
          strokeWidth="3"
        />
      )}

      {displayText && (
        <text
          x={adjustedX + width / 2}
          y={height + 20}
          textAnchor="middle"
          fill={color ?? "#666"}
          fontSize="16"
          fontWeight="bold"
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
}

const Dial: React.FC<DialProps> = ({
  activeChordType,
  hasSixth = false,
  hasSeventh = false,
  hasMajorSeventh = false,
  hasNinth = false,
}) => {
  const size = 60;
  const centerX = -80;
  const centerY = 88;
  const buttonSize = 75;
  const buttonGap = 4;
  const buttonSpacingY = buttonSize + 4;
  const buttonStartX = centerX - size - (buttonSize * 4 + buttonGap * 3) - 30;
  const buttonY = centerY + 35;
  const labelY = buttonY - buttonSize / 2 + 28;

  const renderButtons = (labels: string[], yOffset: number) =>
    labels.map((label, index) => {
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
            fill={isActive ? "#8B4513" : "#111"}
            stroke="#000"
            strokeWidth="1"
            rx="6"
            className="cursor-pointer hover:fill-neutral-900"
          />
          <text
            x={buttonStartX + (buttonSize + buttonGap) * index + 8}
            y={labelY + yOffset}
            textAnchor="start"
            fill={isActive ? "white" : "#666"}
            fontSize="14"
          >
            {label}
          </text>
        </g>
      );
    });

  return (
    <g>
      {renderButtons(["Dim", "Min", "Maj", "Sus"], -buttonSpacingY / 2)}
      {renderButtons(["6", "m7", "M7", "9"], buttonSpacingY / 2)}
      <circle
        cx={centerX}
        cy={centerY}
        r={size}
        fill="#111"
        stroke="#000"
        strokeWidth="1"
        className="cursor-pointer hover:fill-neutral-900"
      />
      <circle
        cx={centerX}
        cy={centerY + size + 50}
        r={size * 0.45}
        fill="#111"
        stroke="#000"
        strokeWidth="1"
        className="cursor-pointer hover:fill-neutral-900"
      />
    </g>
  );
};

export const PianoKeyboard: React.FC = () => {
  // Track notes for each channel separately using a ref instead of state
  const activeNotesRef = useRef<Record<number, Set<number>>>({
    1: new Set<number>(),
    2: new Set<number>(),
    3: new Set<number>(),
  });

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
      } else if (isNoteOff) {
        channelNotes.delete(noteNumber);
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
      } else if (channel === 2) {
        updateBassNotesDisplay(Array.from(channelNotes));
      } else if (channel === 3) {
        updateChordInfo(Array.from(channelNotes));
      }
    },
    [updateKeyboardDisplay, updateBassNotesDisplay, updateChordInfo],
  );

  useEffect(() => {
    if (!("requestMIDIAccess" in navigator)) {
      setMidiDevice("MIDI not supported in this browser");
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
      .catch(() => setMidiDevice("No MIDI access"));
  }, [handleMIDINote]);

  // Extract chord type from chordInfo and map it to button labels
  const activeChordType =
    chordInfo?.chordName
      .split(" ")[1]
      ?.replace("7th", "7")
      ?.replace("Major", "Maj")
      ?.replace("Minor", "Min")
      ?.replace("Diminished", "Dim")
      ?.replace("Dominant", "")
      ?.replace("Sus4", "Sus")
      ?.replace("Sus2", "Sus") ?? undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="mb-2 font-old-standard text-2xl font-semibold italic text-white">
        {midiDevice}
      </div>
      <div className="relative">
        <svg width="850" height="330" viewBox="-520 0 1040 300">
          <Dial
            activeChordType={activeChordType}
            hasSixth={chordInfo?.hasSixth}
            hasSeventh={chordInfo?.hasSeventh}
            hasMajorSeventh={chordInfo?.hasMajorSeventh}
            hasNinth={chordInfo?.hasNinth}
          />
          <g>
            {/* Table header - always shown */}
            <text x="0" y="-40" textAnchor="start" fill="#666" fontSize="12">
              Chord
            </text>
            <text x="125" y="-40" textAnchor="start" fill="#666" fontSize="12">
              Inversion
            </text>
            <text x="250" y="-40" textAnchor="start" fill="#666" fontSize="12">
              Bass
            </text>

            {/* Table content - only shown when chordInfo exists */}
            {chordInfo && (
              <>
                <text
                  x="0"
                  y="-20"
                  textAnchor="start"
                  fill="white"
                  fontSize="14"
                  className="font-medium"
                >
                  {chordInfo.chordName}
                </text>
                <text
                  x="125"
                  y="-20"
                  textAnchor="start"
                  fill="white"
                  fontSize="14"
                  className="font-medium"
                >
                  {chordInfo.inversion}
                </text>
                <text
                  x="250"
                  y="-20"
                  textAnchor="start"
                  fill="white"
                  fontSize="14"
                  className="font-medium"
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
