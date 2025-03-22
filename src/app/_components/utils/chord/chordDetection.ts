import type { NoteName, ChordType, ChordInfo } from "../../types/chord.types";
import { BASE_NOTES, CHORD_DEFINITIONS } from "../../constants/chord.constants";
import { getBaseNoteName, getMIDINoteName } from "../midi/midiUtils";

// Root position intervals derived from chord definitions
export const ROOT_POSITION_INTERVALS = Object.fromEntries(
  Object.entries(CHORD_DEFINITIONS).map(([key, def]) => [key, def.intervals]),
) as unknown as Record<ChordType, readonly number[]>;

/**
 * Generates all possible inversions for a given set of root position intervals.
 */
const generateInversions = (
  rootPositionIntervals: readonly number[],
): number[][] => {
  if (rootPositionIntervals.length !== 3) {
    throw new Error("Root position intervals must contain exactly 3 notes");
  }

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
 * Gets unique base notes from an array of MIDI note numbers
 */
export const getUniqueBaseNotes = (notes: number[]): NoteName[] => {
  const baseNotes = notes.map((note) => getBaseNoteName(note));
  return [...new Set(baseNotes)] as NoteName[];
};

/**
 * Calculates intervals between MIDI notes as positions in the chromatic scale (0-11)
 */
export const calculateIntervals = (notes: number[]): number[] => {
  if (notes.length === 0) return [];
  return notes.map((note) => note % 12);
};

/**
 * Normalizes intervals relative to a root note
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
 */
export const findChordPattern = (
  normalizedIntervals: number[],
  rootNote: NoteName,
): { chordType: ChordType; pattern: number[]; rootNote: NoteName } | null => {
  // Filter out potential 9ths (interval of 2) for triad identification
  const triadIntervals = normalizedIntervals
    .filter((interval) => interval !== 2) // Remove 9ths
    .slice(0, 3); // Only use first 3 non-ninth intervals for triad identification

  if (triadIntervals.length < 3) return null;

  for (const [chordType, inversions] of Object.entries(CHORD_PATTERNS)) {
    for (const pattern of inversions) {
      if (!pattern) continue;

      if (triadIntervals.every((interval, j) => interval === pattern[j])) {
        // For sus4 chords, check if the fourth interval is present
        if (chordType === "Sus4") {
          const fourth = triadIntervals[1];
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
 * Checks for extended chord intervals in the normalized intervals
 */
const checkExtendedIntervals = (
  intervals: number[],
): {
  hasSixth: boolean;
  hasSeventh: boolean;
  hasMajorSeventh: boolean;
  hasNinth: boolean;
} => {
  return {
    hasSixth: intervals.includes(9), // Major 6th is 9 semitones
    hasSeventh: intervals.includes(10), // Minor 7th is 10 semitones
    hasMajorSeventh: intervals.includes(11), // Major 7th is 11 semitones
    hasNinth: intervals.includes(2), // 9th is 2 semitones (in next octave)
  };
};

/**
 * Gets chord information from an array of MIDI note numbers
 */
export const getChordInfo = (notes: number[]): ChordInfo | null => {
  if (notes.length < 3) return null;

  // Remove duplicate MIDI notes while preserving order
  const uniqueMidiNotes = [...new Set(notes)];
  if (uniqueMidiNotes.length < 3) return null;

  // Sort MIDI notes to make interval calculation easier
  const sortedNotes = [...uniqueMidiNotes].sort((a, b) => a - b);
  const lowestNote = sortedNotes[0];
  if (lowestNote === undefined) return null;

  // Check for 9th by looking at actual intervals between notes
  const hasNinth = sortedNotes.some((note, i) => {
    if (i === 0) return false;
    const interval = note - lowestNote;
    return interval > 12 && interval % 12 === 2; // 14 semitones = 9th
  });

  // Calculate intervals for chord identification (using first 3 notes)
  const intervals = calculateIntervals(uniqueMidiNotes);
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
        Math.min(...uniqueMidiNotes),
        match.rootNote,
      );

      // Check for extended intervals
      const {
        hasSixth,
        hasSeventh,
        hasMajorSeventh,
        hasNinth: hasNinthFromIntervals,
      } = checkExtendedIntervals(normalizedIntervals);

      return {
        chordName: `${match.rootNote} ${match.chordType}`,
        inversion: inversionText,
        bassNote: lowestNoteName,
        hasSixth,
        hasSeventh,
        hasMajorSeventh,
        hasNinth: hasNinth || hasNinthFromIntervals,
      };
    }
  }

  return null;
};
