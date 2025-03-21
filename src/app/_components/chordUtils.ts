// Types
export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";
export type ChordType =
  | "Major"
  | "Minor"
  | "Diminished"
  | "Augmented"
  | "Major 7th"
  | "Minor 7th"
  | "Dominant 7th"
  | "Sus4"
  | "Sus2"
  | "6th"
  | "9th";
export type Inversion = number[];

// Constants
export const BASE_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
export const NOTE_OFFSETS: Record<string, number> = {
  C: -11,
  D: -9,
  E: -7,
  F: -6,
  G: -4,
  A: -2,
  B: 0,
} as const;

// Octave mapping for each note's first voicing index
// This will be used later to show the octave of the voicing
export const OCTAVE_MAPPING: Record<string, number> = {
  C: 4,
  D: 4,
  E: 4,
  F: 3,
  G: 3,
  A: 2,
  B: 2,
} as const;

// Interval constants
export const MAJOR_INTERVALS = [0, 4, 7]; // Root, major third, perfect fifth
export const MINOR_INTERVALS = [0, 3, 7]; // Root, minor third, perfect fifth
export const DIMINISHED_INTERVALS = [0, 3, 6]; // Root, minor third, diminished fifth
export const SUS_INTERVALS = [0, 5, 7]; // Root, perfect fourth, perfect fifth

// Chord patterns
export const CHORD_PATTERNS: Record<ChordType, Inversion[]> = {
  Major: [
    [0, 4, 7],
    [4, 7, 12],
    [7, 12, 16],
  ], // Root, 1st, 2nd inversion
  Minor: [
    [0, 3, 7],
    [3, 7, 12],
    [7, 12, 15],
  ], // Root, 1st, 2nd inversion
  Diminished: [
    [0, 3, 6],
    [3, 6, 9],
  ], // Root, 1st inversion
  Augmented: [
    [0, 4, 8],
    [4, 8, 12],
  ], // Root, 1st inversion
  "Major 7th": [
    [0, 4, 7, 11],
    [4, 7, 11, 12],
    [7, 11, 12, 16],
    [11, 12, 16, 19],
  ],
  "Minor 7th": [
    [0, 3, 7, 10],
    [3, 7, 10, 12],
    [7, 10, 12, 15],
    [10, 12, 15, 19],
  ],
  "Dominant 7th": [
    [0, 4, 7, 10],
    [4, 7, 10, 12],
    [7, 10, 12, 16],
    [10, 12, 16, 19],
  ],
  Sus4: [
    [0, 5, 7],
    [5, 7, 12],
  ], // Root, 1st inversion
  Sus2: [
    [0, 2, 7],
    [2, 7, 12],
  ], // Root, 1st inversion
  "6th": [
    [0, 4, 7, 9],
    [4, 7, 9, 12],
    [7, 9, 12, 16],
  ],
  "9th": [
    [0, 4, 7, 10, 14],
    [4, 7, 10, 14, 16],
    [7, 10, 14, 16, 19],
  ],
} as const;

// Utility functions
export const getMIDINoteName = (midiNote: number): string => {
  const octave = Math.floor(midiNote / 12) - 2;
  const noteIndex = midiNote % 12;
  return `${BASE_NOTES[noteIndex] ?? "C"}${octave}`;
};

export const getBaseNoteName = (midiNote: number): NoteName => {
  const noteIndex = midiNote % 12;
  return BASE_NOTES[noteIndex] ?? "C";
};

// Generate voicings for each note
export const generateVoicings = (
  baseOffset: number,
  intervals: number[],
): number[] => {
  const voicings: number[] = [];
  let currentValue = baseOffset;

  while (currentValue <= 60) {
    // Add each interval from the current position
    intervals.forEach((interval) => {
      const newValue = currentValue + interval;
      if (newValue <= 60) {
        voicings.push(newValue);
      }
    });
    currentValue += 12; // Move up an octave
  }

  return voicings;
};

// Get the first voicing (highest number less than 2)
export const getFirstVoicing = (voicings: number[]): number | null => {
  const validVoicings = voicings.filter((v) => v < 2);
  return validVoicings.length > 0 ? Math.max(...validVoicings) : null;
};

// Get all voicings for a note and chord quality
export const getVoicingsForNote = (
  note: NoteName,
  chordQuality: ChordType,
): number[] => {
  let intervals: number[];
  switch (chordQuality) {
    case "Major":
      intervals = MAJOR_INTERVALS;
      break;
    case "Minor":
      intervals = MINOR_INTERVALS;
      break;
    case "Diminished":
      intervals = DIMINISHED_INTERVALS;
      break;
    case "Sus4":
      intervals = SUS_INTERVALS;
      break;
    default:
      intervals = MAJOR_INTERVALS; // Default to major
  }

  const baseOffset = NOTE_OFFSETS[note];
  if (baseOffset === undefined) {
    return []; // Return empty array if note offset is undefined
  }
  return generateVoicings(baseOffset, intervals);
};

// Get the first voicing for a note and chord quality
export const getFirstVoicingForNote = (
  note: NoteName,
  chordQuality: ChordType,
): number | null => {
  const voicings = getVoicingsForNote(note, chordQuality);
  return getFirstVoicing(voicings);
};

// Get all first voicings for all whole notes and chord qualities
export const generateFirstVoicingMap = (): Record<
  NoteName,
  Record<ChordType, number | null>
> => {
  const wholeNotes: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];
  const result: Record<
    NoteName,
    Record<ChordType, number | null>
  > = {} as Record<NoteName, Record<ChordType, number | null>>;

  wholeNotes.forEach((note) => {
    result[note] = {} as Record<ChordType, number | null>;
    Object.keys(CHORD_PATTERNS).forEach((chordType) => {
      result[note][chordType as ChordType] = getFirstVoicingForNote(
        note,
        chordType as ChordType,
      );
    });
  });

  return result;
};

// Generate the mapping
export const FIRST_VOICING_MAP = generateFirstVoicingMap();

// Generate voicings for each note and chord type
export const MAJOR_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, MAJOR_INTERVALS),
  D: generateVoicings(-9, MAJOR_INTERVALS),
  E: generateVoicings(-7, MAJOR_INTERVALS),
  F: generateVoicings(-6, MAJOR_INTERVALS),
  G: generateVoicings(-4, MAJOR_INTERVALS),
  A: generateVoicings(-2, MAJOR_INTERVALS),
  B: generateVoicings(0, MAJOR_INTERVALS),
} as const;

export const MINOR_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, MINOR_INTERVALS),
  D: generateVoicings(-9, MINOR_INTERVALS),
  E: generateVoicings(-7, MINOR_INTERVALS),
  F: generateVoicings(-6, MINOR_INTERVALS),
  G: generateVoicings(-4, MINOR_INTERVALS),
  A: generateVoicings(-2, MINOR_INTERVALS),
  B: generateVoicings(0, MINOR_INTERVALS),
} as const;

export const DIMINISHED_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, DIMINISHED_INTERVALS),
  D: generateVoicings(-9, DIMINISHED_INTERVALS),
  E: generateVoicings(-7, DIMINISHED_INTERVALS),
  F: generateVoicings(-6, DIMINISHED_INTERVALS),
  G: generateVoicings(-4, DIMINISHED_INTERVALS),
  A: generateVoicings(-2, DIMINISHED_INTERVALS),
  B: generateVoicings(0, DIMINISHED_INTERVALS),
} as const;

export const SUS_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, SUS_INTERVALS),
  D: generateVoicings(-9, SUS_INTERVALS),
  E: generateVoicings(-7, SUS_INTERVALS),
  F: generateVoicings(-6, SUS_INTERVALS),
  G: generateVoicings(-4, SUS_INTERVALS),
  A: generateVoicings(-2, SUS_INTERVALS),
  B: generateVoicings(0, SUS_INTERVALS),
} as const;

// Chord info interface
export interface ChordInfo {
  chordName: string;
  inversion: string;
  bassNote: string;
}

// Get chord name from notes
export const getChordName = (notes: number[]): ChordInfo | null => {
  if (notes.length < 2) return null;

  // Sort notes and get their base note names (without octave)
  const baseNotes = notes.map((note) => getBaseNoteName(note));
  const uniqueNotes = [...new Set(baseNotes)];

  // Get intervals between notes
  const intervals = uniqueNotes
    .map((note) => {
      const index = BASE_NOTES.indexOf(note);
      return index >= 0 ? index : 0;
    })
    .sort((a, b) => a - b);

  if (intervals.length === 0) return null;

  // Try each note as the root
  for (const [i, rootIndex] of intervals.entries()) {
    // Rotate intervals to try each note as root
    const rotatedIntervals = [
      ...intervals.slice(i),
      ...intervals.slice(0, i).map((n) => n + 12),
    ];

    // Skip if rotatedIntervals is empty
    if (rotatedIntervals.length === 0) continue;

    // Get the first interval and normalize all intervals relative to it
    const firstInterval = rotatedIntervals[0];
    if (firstInterval === undefined) continue;

    // Normalize intervals to start from 0
    const normalizedIntervals = rotatedIntervals.map(
      (n) => (n - firstInterval + 12) % 12,
    );

    // Check against patterns
    for (const [chordType, inversions] of Object.entries(CHORD_PATTERNS)) {
      for (const [, pattern] of inversions.entries()) {
        if (!pattern) continue;

        if (
          normalizedIntervals.length === pattern.length &&
          normalizedIntervals.every((interval, j) => interval === pattern[j])
        ) {
          // The root note is the one we rotated to
          if (
            typeof rootIndex === "number" &&
            rootIndex >= 0 &&
            rootIndex < BASE_NOTES.length
          ) {
            const rootNote = BASE_NOTES[rootIndex];
            if (!rootNote) continue;

            const lowestNoteName = getMIDINoteName(Math.min(...notes));

            // Determine the actual inversion based on the lowest note
            let actualInversionIndex = 0;
            const rootBaseIndex = BASE_NOTES.indexOf(rootNote);
            if (rootBaseIndex !== intervals[0] && intervals[0] !== undefined) {
              // Find which note in the pattern is the lowest note
              const lowestNoteInterval =
                (intervals[0] - rootBaseIndex + 12) % 12;
              actualInversionIndex = pattern.findIndex(
                (interval) => interval === lowestNoteInterval,
              );
              if (actualInversionIndex === -1) actualInversionIndex = 0;
            }

            // Determine inversion text
            let inversionText = "Root";
            if (actualInversionIndex === 1) {
              inversionText = "1st";
            } else if (actualInversionIndex === 2) {
              inversionText = "2nd";
            } else if (actualInversionIndex === 3) {
              inversionText = "3rd";
            }

            return {
              chordName: `${rootNote} ${chordType}`,
              inversion: inversionText,
              bassNote: lowestNoteName,
            };
          }
        }
      }
    }
  }

  // If no pattern matches, return null
  return null;
};

export const getColorBrightness = (
  midiNote: number,
  baseColor: string,
): string => {
  const octave = Math.floor(midiNote / 12) - 2;
  const baseColorInt = parseInt(baseColor.slice(1), 16);
  const r = (baseColorInt >> 16) & 255;
  const g = (baseColorInt >> 8) & 255;
  const b = baseColorInt & 255;

  // Increase brightness based on octave (0-7 range typically for MIDI)
  const brightnessMultiplier = 1 + octave * 0.3; // 30% brighter per octave

  const newR = Math.min(255, Math.round(r * brightnessMultiplier));
  const newG = Math.min(255, Math.round(g * brightnessMultiplier));
  const newB = Math.min(255, Math.round(b * brightnessMultiplier));

  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

// Get chord notes for a specific voicing
export const getChordNotes = (
  baseNote: string,
  voicing: number | undefined,
  quality: "Maj" | "Min" | "Dim" | "Sus",
): string => {
  if (voicing === undefined || voicing === null) return "";

  // Find the base note index in the chromatic scale
  const baseNoteIndex = BASE_NOTES.indexOf(baseNote as NoteName);
  if (baseNoteIndex === -1) return "-";

  // Get the voicings array for this note
  let voicings: number[] = [];
  switch (quality) {
    case "Maj":
      voicings = MAJOR_VOICINGS[baseNote] ?? [];
      break;
    case "Min":
      voicings = MINOR_VOICINGS[baseNote] ?? [];
      break;
    case "Dim":
      voicings = DIMINISHED_VOICINGS[baseNote] ?? [];
      break;
    case "Sus":
      voicings = SUS_VOICINGS[baseNote] ?? [];
      break;
  }

  if (!voicings.length) return "-";

  // Find the index of this voicing in the array
  const voicingIndex = voicings.indexOf(voicing);
  if (voicingIndex === -1) return "-";

  // The pattern repeats every 3 notes, shift by 1 so index 0 is first inversion
  const pattern = (voicingIndex + 1) % 3;

  // Get the correct intervals for this chord quality
  let thirdInterval: number;
  let fifthInterval: number;

  switch (quality) {
    case "Maj":
      thirdInterval = 4; // Major third
      fifthInterval = 7; // Perfect fifth
      break;
    case "Min":
      thirdInterval = 3; // Minor third
      fifthInterval = 7; // Perfect fifth
      break;
    case "Dim":
      thirdInterval = 3; // Minor third
      fifthInterval = 6; // Diminished fifth
      break;
    case "Sus":
      thirdInterval = 5; // Perfect fourth
      fifthInterval = 7; // Perfect fifth
      break;
    default:
      thirdInterval = 4;
      fifthInterval = 7;
  }

  // Calculate notes based on the pattern
  let notes: string[] = [];
  const third = BASE_NOTES[(baseNoteIndex + thirdInterval) % 12];
  const fifth = BASE_NOTES[(baseNoteIndex + fifthInterval) % 12];
  const root = BASE_NOTES[baseNoteIndex];

  if (!third || !fifth || !root) return "-";

  switch (pattern) {
    case 0: // Root position: 1-3-5
      notes = [root, third, fifth];
      break;
    case 1: // First inversion: 3-5-1
      notes = [third, fifth, root];
      break;
    case 2: // Second inversion: 5-1-3
      notes = [fifth, root, third];
      break;
  }

  return notes.join(" ");
};

// Get voicings for a specific chord quality
export const getVoicingsForQuality = (
  quality: "Maj" | "Min" | "Dim" | "Sus",
): Record<string, number[]> => {
  switch (quality) {
    case "Maj":
      return MAJOR_VOICINGS;
    case "Min":
      return MINOR_VOICINGS;
    case "Dim":
      return DIMINISHED_VOICINGS;
    case "Sus":
      return SUS_VOICINGS;
    default:
      return MAJOR_VOICINGS;
  }
};

// Define MIDI message type for better organization
export type MIDIMessageType =
  | "note-on"
  | "note-off"
  | "control-change"
  | "program-change"
  | "unknown";

export interface MIDIMessage {
  timestamp: number;
  channel: number;
  type: MIDIMessageType;
  noteNumber?: number;
  noteName?: string;
  velocity?: number;
  controlNumber?: number;
  controlValue?: number;
  programNumber?: number;
  rawData: number[];
}

export const parseMIDIMessage = (
  data: Uint8Array,
  timestamp: number
): MIDIMessage | null => {
  if (data.length < 1) return null;

  const statusByte = data?.[0];
  const messageType = statusByte ? statusByte >> 4 : 0;
  const channel = statusByte ? (statusByte & 0x0f) + 1 : 0;

  let type: MIDIMessageType = "unknown";
  let noteNumber: number | undefined;
  let noteName: string | undefined;
  let velocity: number | undefined;
  let controlNumber: number | undefined;
  let controlValue: number | undefined;
  let programNumber: number | undefined;

  // Note-on message
  if (messageType === 9) {
    type = data?.[2] !== undefined && data[2] > 0 ? "note-on" : "note-off"; // Note-on with velocity 0 is treated as note-off
    noteNumber = data[1];
    noteName = noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
    velocity = data[2];
  }
  // Note-off message
  else if (messageType === 8) {
    type = "note-off";
    noteNumber = data[1];
    noteName = noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
    velocity = data[2];
  }
  // Control change
  else if (messageType === 11) {
    type = "control-change";
    controlNumber = data[1];
    controlValue = data[2];
  }
  // Program change
  else if (messageType === 12) {
    type = "program-change";
    programNumber = data[1];
  }

  return {
    timestamp,
    channel,
    type,
    noteNumber,
    noteName,
    velocity,
    controlNumber,
    controlValue,
    programNumber,
    rawData: Array.from(data),
  };
};
