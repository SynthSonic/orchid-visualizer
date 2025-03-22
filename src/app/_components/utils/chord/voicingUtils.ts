import type {
  NoteName,
  ChordType,
  ChordShortName,
} from "../../types/chord.types";
import {
  BASE_NOTES,
  CHORD_DEFINITIONS,
  NOTE_OFFSETS,
} from "../../constants/chord.constants";
import { ROOT_POSITION_INTERVALS, CHORD_PATTERNS } from "./chordDetection";

/**
 * Generates voicings for a given base offset and intervals
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
 * Gets all voicings for a given note and chord quality
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
 */
export const getFirstVoicingForNote = (
  note: NoteName,
  chordQuality: ChordType,
): number | null => {
  const voicings = getVoicingsForNote(note, chordQuality);
  return voicings[0] ?? null;
};

/**
 * Generates a map of first voicings for all whole notes and chord qualities
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

/**
 * Gets voicings for a specific chord quality
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
