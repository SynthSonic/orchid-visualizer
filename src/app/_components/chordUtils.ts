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

// Only include triad types
export type ChordType = "Major" | "Minor" | "Diminished" | "Sus4";

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

// Root position intervals for each triad type
export const ROOT_POSITION_INTERVALS = {
  Major: [0, 4, 7] as const, // Root, major third, perfect fifth
  Minor: [0, 3, 7] as const, // Root, minor third, perfect fifth
  Diminished: [0, 3, 6] as const, // Root, minor third, diminished fifth
  Sus4: [0, 5, 7] as const, // Root, perfect fourth, perfect fifth
} as const;

// Helper function to generate inversions from root position intervals
const generateInversions = (
  rootPositionIntervals: readonly number[],
): Inversion[] => {
  if (rootPositionIntervals.length !== 3) {
    throw new Error("Root position intervals must contain exactly 3 notes");
  }

  // After length check, we know this is safe
  const [root, second, third] = rootPositionIntervals as [
    number,
    number,
    number,
  ];
  const inversions: Inversion[] = [];

  // Root position
  inversions.push([root, second, third]);

  // First inversion - shift first note up an octave
  inversions.push([second, third, root + 12]);

  // Second inversion - shift first two notes up an octave
  inversions.push([third, root + 12, second + 12]);

  return inversions;
};

// Generate chord patterns for triads
export const CHORD_PATTERNS: Record<ChordType, Inversion[]> = {
  Major: generateInversions([...ROOT_POSITION_INTERVALS.Major]),
  Minor: generateInversions([...ROOT_POSITION_INTERVALS.Minor]),
  Diminished: generateInversions([...ROOT_POSITION_INTERVALS.Diminished]),
  Sus4: generateInversions([...ROOT_POSITION_INTERVALS.Sus4]),
} as const;

// Utility functions
export const getMIDINoteName = (midiNote: number): string => {
  const octave = Math.floor(midiNote / 12) - 1;
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
  const intervals = ROOT_POSITION_INTERVALS[chordQuality];
  if (!intervals) {
    return []; // Return empty array if intervals are undefined
  }

  const baseOffset = NOTE_OFFSETS[note];
  if (baseOffset === undefined) {
    return []; // Return empty array if note offset is undefined
  }
  return generateVoicings(baseOffset, [...intervals]);
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
  C: generateVoicings(-11, [...ROOT_POSITION_INTERVALS.Major]),
  D: generateVoicings(-9, [...ROOT_POSITION_INTERVALS.Major]),
  E: generateVoicings(-7, [...ROOT_POSITION_INTERVALS.Major]),
  F: generateVoicings(-6, [...ROOT_POSITION_INTERVALS.Major]),
  G: generateVoicings(-4, [...ROOT_POSITION_INTERVALS.Major]),
  A: generateVoicings(-2, [...ROOT_POSITION_INTERVALS.Major]),
  B: generateVoicings(0, [...ROOT_POSITION_INTERVALS.Major]),
} as const;

export const MINOR_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, [...ROOT_POSITION_INTERVALS.Minor]),
  D: generateVoicings(-9, [...ROOT_POSITION_INTERVALS.Minor]),
  E: generateVoicings(-7, [...ROOT_POSITION_INTERVALS.Minor]),
  F: generateVoicings(-6, [...ROOT_POSITION_INTERVALS.Minor]),
  G: generateVoicings(-4, [...ROOT_POSITION_INTERVALS.Minor]),
  A: generateVoicings(-2, [...ROOT_POSITION_INTERVALS.Minor]),
  B: generateVoicings(0, [...ROOT_POSITION_INTERVALS.Minor]),
} as const;

export const DIMINISHED_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, [...ROOT_POSITION_INTERVALS.Diminished]),
  D: generateVoicings(-9, [...ROOT_POSITION_INTERVALS.Diminished]),
  E: generateVoicings(-7, [...ROOT_POSITION_INTERVALS.Diminished]),
  F: generateVoicings(-6, [...ROOT_POSITION_INTERVALS.Diminished]),
  G: generateVoicings(-4, [...ROOT_POSITION_INTERVALS.Diminished]),
  A: generateVoicings(-2, [...ROOT_POSITION_INTERVALS.Diminished]),
  B: generateVoicings(0, [...ROOT_POSITION_INTERVALS.Diminished]),
} as const;

export const SUS_VOICINGS: Record<string, number[]> = {
  C: generateVoicings(-11, [...ROOT_POSITION_INTERVALS.Sus4]),
  D: generateVoicings(-9, [...ROOT_POSITION_INTERVALS.Sus4]),
  E: generateVoicings(-7, [...ROOT_POSITION_INTERVALS.Sus4]),
  F: generateVoicings(-6, [...ROOT_POSITION_INTERVALS.Sus4]),
  G: generateVoicings(-4, [...ROOT_POSITION_INTERVALS.Sus4]),
  A: generateVoicings(-2, [...ROOT_POSITION_INTERVALS.Sus4]),
  B: generateVoicings(0, [...ROOT_POSITION_INTERVALS.Sus4]),
} as const;

// Chord info interface
export interface ChordInfo {
  chordName: string;
  inversion: string;
  bassNote: string;
}

// Helper function to get unique base notes from MIDI notes
export const getUniqueBaseNotes = (notes: number[]): NoteName[] => {
  const baseNotes = notes.map((note) => getBaseNoteName(note));
  return [...new Set(baseNotes)] as NoteName[];
};

// Helper function to calculate intervals between notes
export const calculateIntervals = (notes: NoteName[]): number[] => {
  return notes.map((note) => {
    const index = BASE_NOTES.indexOf(note);
    return index >= 0 ? index : 0;
  });
};

// Helper function to normalize intervals relative to a root note
export const normalizeIntervals = (
  intervals: number[],
  rootIndex: number,
): number[] => {
  const rotatedIntervals = [
    ...intervals.slice(rootIndex),
    ...intervals.slice(0, rootIndex).map((n) => n + 12),
  ];

  if (rotatedIntervals.length === 0 || rotatedIntervals[0] === undefined) {
    return [];
  }

  const firstInterval = rotatedIntervals[0];
  return rotatedIntervals.map((n) => (n - firstInterval + 12) % 12);
};

// Helper function to find matching chord pattern
export const findChordPattern = (
  normalizedIntervals: number[],
  rootNote: NoteName,
): { chordType: ChordType; pattern: number[]; rootNote: NoteName } | null => {
  for (const [chordType, inversions] of Object.entries(CHORD_PATTERNS)) {
    for (const pattern of inversions) {
      if (!pattern) continue;

      if (
        normalizedIntervals.length === pattern.length &&
        normalizedIntervals.every((interval, j) => interval === pattern[j])
      ) {
        // For sus4 chords, check if the fourth interval is present
        if (chordType === "Sus4") {
          const fourth = normalizedIntervals[1];
          if (fourth === 5) {
            return { chordType: chordType as ChordType, pattern, rootNote };
          }
        } else {
          return { chordType: chordType as ChordType, pattern, rootNote };
        }
      }
    }
  }
  return null;
};

// Helper function to determine inversion
export const determineInversion = (
  lowestNote: number,
  rootNote: NoteName,
): { inversionText: string; lowestNoteName: string } => {
  const lowestNoteName = getMIDINoteName(lowestNote);
  const lowestNoteBase = getBaseNoteName(lowestNote);

  let inversionText = "Root";
  const lowestNoteIndex = BASE_NOTES.indexOf(lowestNoteBase);
  const rootNoteIndex = BASE_NOTES.indexOf(rootNote);

  if (lowestNoteIndex !== rootNoteIndex) {
    const interval = (lowestNoteIndex - rootNoteIndex + 12) % 12;
    if (interval === 4 || interval === 3) {
      // Major or minor third
      inversionText = "1st";
    } else if (interval === 7 || interval === 6) {
      // Perfect or diminished fifth
      inversionText = "2nd";
    } else if (interval === 10 || interval === 11) {
      // Minor or major seventh
      inversionText = "3rd";
    }
  }

  return { inversionText, lowestNoteName };
};

// Main chord identification function
export const getChordInfo = (notes: number[]): ChordInfo | null => {
  if (notes.length < 2) return null;

  // Get unique base notes
  const uniqueNotes = getUniqueBaseNotes(notes);

  // Calculate intervals
  const intervals = calculateIntervals(uniqueNotes);
  if (intervals.length === 0) return null;

  // Try each note as the root
  for (const [i, rootIndex] of intervals.entries()) {
    // Skip if rootIndex is invalid
    if (
      typeof rootIndex !== "number" ||
      rootIndex < 0 ||
      rootIndex >= BASE_NOTES.length
    ) {
      continue;
    }

    const rootNote = BASE_NOTES[rootIndex];
    if (!rootNote) continue;

    // Normalize intervals
    const normalizedIntervals = normalizeIntervals(intervals, i);
    if (normalizedIntervals.length === 0) continue;

    // Find matching chord pattern
    const match = findChordPattern(normalizedIntervals, rootNote);
    if (match) {
      // Determine inversion
      const { inversionText, lowestNoteName } = determineInversion(
        Math.min(...notes),
        match.rootNote,
      );

      return {
        chordName: `${match.rootNote} ${match.chordType}`,
        inversion: inversionText,
        bassNote: lowestNoteName,
      };
    }
  }

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
  let intervals: readonly number[];
  switch (quality) {
    case "Maj":
      intervals = ROOT_POSITION_INTERVALS.Major;
      break;
    case "Min":
      intervals = ROOT_POSITION_INTERVALS.Minor;
      break;
    case "Dim":
      intervals = ROOT_POSITION_INTERVALS.Diminished;
      break;
    case "Sus":
      intervals = ROOT_POSITION_INTERVALS.Sus4;
      break;
    default:
      intervals = ROOT_POSITION_INTERVALS.Major;
  }

  // Calculate notes based on the pattern
  let notes: string[] = [];
  if (intervals.length < 3) return "-";

  const secondInterval = intervals[1];
  const thirdInterval = intervals[2];
  if (secondInterval === undefined || thirdInterval === undefined) return "-";

  const third = BASE_NOTES[(baseNoteIndex + secondInterval) % 12];
  const fifth = BASE_NOTES[(baseNoteIndex + thirdInterval) % 12];
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
  timestamp: number,
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
    noteName =
      noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
    velocity = data[2];
  }
  // Note-off message
  else if (messageType === 8) {
    type = "note-off";
    noteNumber = data[1];
    noteName =
      noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
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
