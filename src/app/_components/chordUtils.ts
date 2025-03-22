import type {
  NoteName,
  ChordType,
  ChordShortName,
  ChordInfo,
  MIDIMessage,
  MIDIMessageType,
} from "./types/chord.types";

import {
  BASE_NOTES,
  CHORD_DEFINITIONS,
  NOTE_OFFSETS,
} from "./constants/chord.constants";

// Root position intervals derived from chord definitions
export const ROOT_POSITION_INTERVALS = Object.fromEntries(
  Object.entries(CHORD_DEFINITIONS).map(([key, def]) => [key, def.intervals]),
) as unknown as Record<ChordType, readonly number[]>;

/**
 * Generates all possible inversions for a given set of root position intervals.
 * @param rootPositionIntervals - The intervals of the chord in root position
 * @returns Array of inversions, each containing the intervals for that inversion
 * @throws Error if the input intervals array does not contain exactly 3 notes
 */
const generateInversions = (
  rootPositionIntervals: readonly number[],
): number[][] => {
  if (rootPositionIntervals.length !== 3) {
    throw new Error("Root position intervals must contain exactly 3 notes");
  }

  // After length check, we know this is safe to assert
  const [root, second, third] = rootPositionIntervals as readonly [
    number,
    number,
    number,
  ];
  const inversions: number[][] = [];

  // Root position
  inversions.push([root, second, third]);

  // First inversion - shift first note up an octave
  inversions.push([second, third, root + 12]);

  // Second inversion - shift first two notes up an octave
  inversions.push([third, root + 12, second + 12]);

  return inversions;
};

// Generate chord patterns for triads
export const CHORD_PATTERNS: Record<ChordType, number[][]> = {
  Major: generateInversions([...ROOT_POSITION_INTERVALS.Major]),
  Minor: generateInversions([...ROOT_POSITION_INTERVALS.Minor]),
  Diminished: generateInversions([...ROOT_POSITION_INTERVALS.Diminished]),
  Sus4: generateInversions([...ROOT_POSITION_INTERVALS.Sus4]),
} as const;

/**
 * Converts a MIDI note number to a note name with octave
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name with octave (e.g. "C4")
 */
export const getMIDINoteName = (midiNote: number): string => {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${BASE_NOTES[noteIndex] ?? "C"}${octave}`;
};

/**
 * Gets the base note name without octave from a MIDI note number
 * @param midiNote - MIDI note number (0-127)
 * @returns Base note name (e.g. "C")
 */
export const getBaseNoteName = (midiNote: number): NoteName => {
  const noteIndex = midiNote % 12;
  return BASE_NOTES[noteIndex] ?? "C";
};

/**
 * Generates voicings for a given base offset and intervals
 * @param baseOffset - The base offset to start generating voicings from
 * @param intervals - The intervals to generate voicings for
 * @returns Array of voicing numbers
 */
export const generateVoicings = (
  baseOffset: number,
  intervals: number[],
): number[] => {
  const voicings: number[] = [];
  let currentValue = baseOffset;

  while (currentValue <= 60) {
    intervals.forEach((interval) => {
      const newValue = currentValue + interval;
      if (newValue <= 60) {
        voicings.push(newValue);
      }
    });
    currentValue += 12;
  }

  return voicings;
};

/**
 * Gets the first valid voicing from an array of voicings
 * @param voicings - Array of voicing numbers
 * @returns The first valid voicing or null if none found
 */
export const getFirstVoicing = (voicings: number[]): number | null => {
  const validVoicings = voicings.filter((v) => v < 2);
  return validVoicings.length > 0 ? Math.max(...validVoicings) : null;
};

/**
 * Gets all voicings for a given note and chord quality
 * @param note - The root note
 * @param chordQuality - The chord quality (e.g. Major, Minor)
 * @returns Array of voicing numbers
 */
export const getVoicingsForNote = (
  note: NoteName,
  chordQuality: ChordType,
): number[] => {
  const intervals = ROOT_POSITION_INTERVALS[chordQuality];
  if (!intervals) return [];

  const baseOffset = NOTE_OFFSETS[note];
  if (baseOffset === undefined) return [];

  return generateVoicings(baseOffset, [...intervals]);
};

/**
 * Gets the first voicing for a given note and chord quality
 * @param note - The root note
 * @param chordQuality - The chord quality (e.g. Major, Minor)
 * @returns The first valid voicing or null if none found
 */
export const getFirstVoicingForNote = (
  note: NoteName,
  chordQuality: ChordType,
): number | null => {
  const voicings = getVoicingsForNote(note, chordQuality);
  return getFirstVoicing(voicings);
};

/**
 * Generates a map of first voicings for all whole notes and chord qualities
 * @returns Record mapping notes and chord qualities to their first voicings
 */
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

/**
 * Parses raw MIDI message data into a structured format
 * @param data - Raw MIDI message data
 * @param timestamp - Message timestamp
 * @returns Parsed MIDI message or null if invalid data
 */
export const parseMIDIMessage = (
  data: Uint8Array,
  timestamp: number,
): MIDIMessage | null => {
  if (!data || data.length < 1) return null;

  const statusByte = data[0];
  if (statusByte === undefined) return null;

  const messageType = statusByte >> 4;
  const channel = (statusByte & 0x0f) + 1;

  let type: MIDIMessageType = "unknown";
  let noteNumber: number | undefined;
  let noteName: string | undefined;
  let velocity: number | undefined;
  let controlNumber: number | undefined;
  let controlValue: number | undefined;
  let programNumber: number | undefined;

  switch (messageType) {
    case 9: // Note-on
      if (data[2] === undefined) return null;
      type = data[2] > 0 ? "note-on" : "note-off";
      noteNumber = data[1];
      noteName =
        noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
      velocity = data[2];
      break;
    case 8: // Note-off
      type = "note-off";
      noteNumber = data[1];
      noteName =
        noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
      velocity = data[2];
      break;
    case 11: // Control change
      type = "control-change";
      controlNumber = data[1];
      controlValue = data[2];
      break;
    case 12: // Program change
      type = "program-change";
      programNumber = data[1];
      break;
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

/**
 * Gets voicings for a specific chord quality
 * @param quality - The chord quality shortname (e.g. "Maj", "Min")
 * @returns Record mapping notes to their voicings
 */
export const getVoicingsForQuality = (
  quality: ChordShortName,
): Record<string, number[]> => {
  const chordType = Object.entries(CHORD_DEFINITIONS).find(
    ([_, def]) => def.shortName === quality,
  )?.[0] as ChordType | undefined;

  if (!chordType) {
    return generateVoicingsForChordType(ROOT_POSITION_INTERVALS.Major);
  }

  return generateVoicingsForChordType(ROOT_POSITION_INTERVALS[chordType]);
};

/**
 * Generates all voicings for a chord type
 * @param intervals - The intervals that define the chord
 * @returns Record mapping notes to their voicings
 */
const generateVoicingsForChordType = (
  intervals: readonly number[],
): Record<NoteName, number[]> => {
  const voicings: Record<NoteName, number[]> = {} as Record<NoteName, number[]>;

  // Only use natural notes (no sharps/flats) as defined in NOTE_OFFSETS
  Object.entries(NOTE_OFFSETS).forEach(([note, offset]) => {
    voicings[note as NoteName] = generateVoicings(offset, [...intervals]);
  });

  return voicings;
};

/**
 * Gets the notes that make up a chord in a specific voicing
 * @param baseNote - The root note of the chord
 * @param voicing - The voicing number
 * @param quality - The chord quality shortname
 * @returns Space-separated string of notes or "-" if invalid
 */
export const getChordNotes = (
  baseNote: string,
  voicing: number | undefined,
  quality: ChordShortName,
): string => {
  if (voicing === undefined || voicing === null) return "";

  // Find the base note index in the chromatic scale
  const baseNoteIndex = BASE_NOTES.indexOf(baseNote as NoteName);
  if (baseNoteIndex === -1) return "-";

  // Get the voicings array for this note
  const voicings = getVoicingsForQuality(quality)[baseNote] ?? [];
  if (!voicings.length) return "-";

  // Find the index of this voicing in the array
  const voicingIndex = voicings.indexOf(voicing);
  if (voicingIndex === -1) return "-";

  // The pattern repeats every 3 notes, shift by 1 so index 0 is first inversion
  const pattern = (voicingIndex + 1) % 3;

  // Get the correct intervals for this chord quality
  const chordType = Object.entries(CHORD_DEFINITIONS).find(
    ([_, def]) => def.shortName === quality,
  )?.[0] as ChordType | undefined;

  if (!chordType) return "-";

  const intervals = ROOT_POSITION_INTERVALS[chordType];

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

/**
 * Gets unique base notes from an array of MIDI note numbers
 * @param notes - Array of MIDI note numbers
 * @returns Array of unique base note names
 */
export const getUniqueBaseNotes = (notes: number[]): NoteName[] => {
  const baseNotes = notes.map((note) => getBaseNoteName(note));
  return [...new Set(baseNotes)] as NoteName[];
};

/**
 * Calculates intervals between notes
 * @param notes - Array of note names
 * @returns Array of intervals (in semitones)
 */
export const calculateIntervals = (notes: NoteName[]): number[] => {
  return notes.map((note) => {
    const index = BASE_NOTES.indexOf(note);
    return index >= 0 ? index : 0;
  });
};

/**
 * Normalizes intervals relative to a root note
 * @param intervals - Array of intervals
 * @param rootIndex - Index of the root note
 * @returns Array of normalized intervals
 */
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

/**
 * Finds a matching chord pattern for a set of intervals
 * @param normalizedIntervals - Array of normalized intervals
 * @param rootNote - The root note
 * @returns Matching chord pattern or null if no match found
 */
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

/**
 * Determines the inversion of a chord based on its lowest note
 * @param lowestNote - MIDI note number of the lowest note
 * @param rootNote - Root note of the chord
 * @returns Object containing inversion text and lowest note name
 */
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

/**
 * Gets chord information from an array of MIDI notes
 * @param notes - Array of MIDI note numbers
 * @returns Chord information or null if no chord identified
 */
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

/**
 * Adjusts color brightness based on MIDI note number
 * @param midiNote - MIDI note number
 * @param baseColor - Base color in hex format
 * @returns Adjusted color in hex format
 */
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

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};
