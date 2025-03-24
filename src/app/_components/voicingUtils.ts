import type { NoteName, ChordType, ChordShortName } from "./types/chord.types";
import {
  BASE_NOTES,
  CHORD_DEFINITIONS,
  NOTE_OFFSETS,
} from "./constants/chord.constants";
import { ROOT_POSITION_INTERVALS, CHORD_PATTERNS } from "./chordUtils";

/**
 * Generates voicings for a given base offset and intervals
 * @param baseOffset - The base offset to start generating voicings from
 * @param intervals - The intervals to generate voicings for
 * @returns Object mapping indices to voicing information
 */
export const generateVoicings = (
  baseOffset: number,
  intervals: number[],
): Record<number, { voicing: number; inversion: number; octave: number }> => {
  const voicings: Record<
    number,
    { voicing: number; inversion: number; octave: number }
  > = {};
  let currentValue = baseOffset;
  let voicingIndex = 0;

  while (currentValue <= 60) {
    intervals.forEach((interval) => {
      const newValue = currentValue + interval;
      if (newValue <= 60) {
        // Calculate inversion (0 = first, 1 = second, 2 = root)
        const inversion = (voicingIndex + 1) % 3;
        // Calculate octave (0 for first two, then increments every 3)
        const octave = Math.floor((voicingIndex + 1) / 3);

        voicings[voicingIndex] = {
          voicing: newValue,
          inversion,
          octave,
        };
        voicingIndex++;
      }
    });
    currentValue += 12;
  }

  return voicings;
};

/**
 * Gets the first valid voicing from a voicings object
 * @param voicings - Object mapping indices to voicing information
 * @returns The first valid voicing or null if none found
 */
export const getFirstVoicing = (
  voicings: Record<
    number,
    { voicing: number; inversion: number; octave: number }
  >,
): number | null => {
  const validVoicings = Object.values(voicings).filter((v) => v.voicing < 2);
  return validVoicings.length > 0
    ? Math.max(...validVoicings.map((v) => v.voicing))
    : null;
};

/**
 * Gets all voicings for a given note and chord quality
 * @param note - The root note
 * @param chordQuality - The chord quality (e.g. Major, Minor)
 * @returns Object mapping indices to voicing information
 */
export const getVoicingsForNote = (
  note: NoteName,
  chordQuality: ChordType,
): Record<number, { voicing: number; inversion: number; octave: number }> => {
  const intervals = ROOT_POSITION_INTERVALS[chordQuality];
  if (!intervals) return {};

  const baseOffset = NOTE_OFFSETS[note];
  if (baseOffset === undefined) return {};

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

/**
 * Gets voicings for a specific chord quality
 * @param quality - The chord quality shortname (e.g. "Maj", "Min")
 * @returns Record mapping notes to their voicings with inversion and octave information
 */
export const getVoicingsForQuality = (
  quality: ChordShortName,
): Record<
  string,
  Record<number, { voicing: number; inversion: number; octave: number }>
> => {
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
): Record<
  NoteName,
  Record<number, { voicing: number; inversion: number; octave: number }>
> => {
  const voicings: Record<
    NoteName,
    Record<number, { voicing: number; inversion: number; octave: number }>
  > = {} as Record<
    NoteName,
    Record<number, { voicing: number; inversion: number; octave: number }>
  >;

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
 * @returns Space-separated string of notes with octave numbers or "-" if invalid
 */
export const getChordNotes = (
  baseNote: string,
  voicing: { voicing: number; inversion: number; octave: number } | undefined,
  quality: ChordShortName,
): string => {
  if (voicing === undefined || voicing === null) return "";

  // Find the base note index in the chromatic scale
  const baseNoteIndex = BASE_NOTES.indexOf(baseNote as NoteName);
  if (baseNoteIndex === -1) return "-";

  // Get the voicings array for this note
  const voicings = getVoicingsForQuality(quality)[baseNote] ?? {};
  if (Object.keys(voicings).length === 0) return "-";

  // Find the index of this voicing in the array
  const voicingIndex = Object.values(voicings).findIndex(
    (v) => v.voicing === voicing.voicing,
  );
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

  // Calculate octaves based on the base note's octave and inversion pattern
  const baseOctave = voicing.octave;

  // Helper function to determine if a note needs to increment octave
  const needsOctaveIncrement = (noteIndex: number, baseIndex: number) => {
    return noteIndex < baseIndex;
  };

  // Calculate octave adjustments for third and fifth
  const thirdOctaveAdjustment = needsOctaveIncrement(
    (baseNoteIndex + secondInterval) % 12,
    baseNoteIndex,
  )
    ? 1
    : 0;
  const fifthOctaveAdjustment = needsOctaveIncrement(
    (baseNoteIndex + thirdInterval) % 12,
    baseNoteIndex,
  )
    ? 1
    : 0;

  switch (pattern) {
    case 0: // Root position: 1-3-5
      notes = [
        `${root}${baseOctave}`,
        `${third}${baseOctave + thirdOctaveAdjustment}`,
        `${fifth}${baseOctave + fifthOctaveAdjustment}`,
      ];
      break;
    case 1: // First inversion: 3-5-1
      notes = [
        `${third}${baseOctave + thirdOctaveAdjustment}`,
        `${fifth}${baseOctave + fifthOctaveAdjustment}`,
        `${root}${baseOctave + 1}`,
      ];
      break;
    case 2: // Second inversion: 5-1-3
      notes = [
        `${fifth}${baseOctave + fifthOctaveAdjustment}`,
        `${root}${baseOctave + 1}`,
        `${third}${baseOctave + thirdOctaveAdjustment + 1}`,
      ];
      break;
  }

  return notes.join(" ");
};
