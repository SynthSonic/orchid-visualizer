"use client";

import { useState, useEffect, useCallback } from "react";
import type { NoteName, ChordInfo } from "./chordUtils";
import {
  getMIDINoteName,
  getChordName,
  getColorBrightness,
} from "./chordUtils";

// Simplified WebMidi types
interface MIDIPort {
  name: string | null;
  state: string;
  onmidimessage: ((event: { data: Uint8Array }) => void) | null;
}

interface MIDIAccess {
  inputs: Map<string, MIDIPort>;
  onstatechange: ((event: { port: MIDIPort }) => void) | null;
}

const BASE_CHORD_COLOR = "#8B4513"; // Darker saddle brown color

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
}

// Components
const Key: React.FC<KeyProps> = ({
  note: _note,
  x,
  isBlack = false,
  color,
  displayText,
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
}

const Dial: React.FC<DialProps> = ({ activeChordType }) => {
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
        activeChordType &&
        ((yOffset < 0 && label === activeChordType) || // Top row
          (yOffset > 0 && label === activeChordType)); // Bottom row

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
  const [keyColors, setKeyColors] = useState<Record<string, string>>({});
  const [, setActiveNotes] = useState<Set<number>>(new Set());
  const [midiDevice, setMidiDevice] = useState<string>(
    "No MIDI device connected",
  );
  const [noteDisplayText, setNoteDisplayText] = useState<
    Record<string, string>
  >({});
  const [chordInfo, setChordInfo] = useState<ChordInfo | null>(null);

  const updateNoteStates = useCallback((notes: number[]) => {
    // Batch all state updates together
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
    setChordInfo(getChordName(notes));
  }, []);

  const handleMIDINote = useCallback(
    (command: number, note: number, velocity: number) => {
      const isNoteOn = command === 144 && velocity > 0;
      const isNoteOff = command === 128 || (command === 144 && velocity === 0);

      setActiveNotes((prev) => {
        const updatedNotes = new Set(prev);

        if (isNoteOn) {
          updatedNotes.add(note);
        } else if (isNoteOff) {
          updatedNotes.delete(note);
        }

        // Update all note-related states based on the new set of active notes
        if (updatedNotes.size === 0) {
          setKeyColors({});
          setNoteDisplayText({});
          setChordInfo(null);
        } else {
          updateNoteStates(Array.from(updatedNotes));
        }

        return updatedNotes;
      });
    },
    [updateNoteStates],
  );

  useEffect(() => {
    if (!("requestMIDIAccess" in navigator)) {
      setMidiDevice("MIDI not supported in this browser");
      return;
    }

    (navigator as Navigator & { requestMIDIAccess(): Promise<MIDIAccess> })
      .requestMIDIAccess()
      .then((access) => {
        const inputs = Array.from(access.inputs.values());
        if (inputs.length > 0 && inputs[0]?.name) {
          setMidiDevice(inputs[0].name);
        } else {
          setMidiDevice("No MIDI device connected");
        }

        access.onstatechange = (event) => {
          if (
            event.port &&
            "type" in event.port &&
            event.port.type === "input"
          ) {
            const inputs = Array.from(access.inputs.values());
            if (inputs.length > 0 && inputs[0]?.name) {
              setMidiDevice(inputs[0].name);
              
              // Set up message listeners for all input devices, including the newly connected one
              inputs.forEach((input) => {
                input.onmidimessage = (event) => {
                  const data = event.data;
                  if (data && data.length >= 3) {
                    const command = Number(data[0]);
                    const note = Number(data[1]);
                    const velocity = Number(data[2]);
                    handleMIDINote(command, note, velocity);
                  }
                };
              });
            } else {
              setMidiDevice("No MIDI device connected");
            }
          }
        };

        Array.from(access.inputs.values()).forEach((input) => {
          input.onmidimessage = (event) => {
            const data = event.data;
            if (data && data.length >= 3) {
              const command = Number(data[0]);
              const note = Number(data[1]);
              const velocity = Number(data[2]);
              handleMIDINote(command, note, velocity);
            }
          };
        });
      })
      .catch((_err) => setMidiDevice("No MIDI access"));
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
          <Dial activeChordType={activeChordType} />
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
            />
          ))}
          {NOTES.filter((note) => note.isBlack).map((note) => (
            <Key
              key={note.note}
              {...note}
              color={keyColors[note.note]}
              displayText={noteDisplayText[note.note]}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
