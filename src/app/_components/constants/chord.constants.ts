/**
 * @fileoverview Constants and definitions for musical chord structures and note relationships.
 * This file contains the fundamental building blocks for chord generation and musical notation.
 */

/**
 * Defines the structure of common chord types with their intervals and descriptions.
 * Intervals are represented in semitones from the root note.
 * @readonly
 */
export const CHORD_DEFINITIONS = {
  Major: {
    fullName: "Major",
    shortName: "Maj",
    intervals: [0, 4, 7] as const,
    description: "Root, major third, perfect fifth",
  },
  Minor: {
    fullName: "Minor",
    shortName: "Min",
    intervals: [0, 3, 7] as const,
    description: "Root, minor third, perfect fifth",
  },
  Diminished: {
    fullName: "Diminished",
    shortName: "Dim",
    intervals: [0, 3, 6] as const,
    description: "Root, minor third, diminished fifth",
  },
  Sus4: {
    fullName: "Sus4",
    shortName: "Sus",
    intervals: [0, 5, 7] as const,
    description: "Root, perfect fourth, perfect fifth",
  },
} as const;

/**
 * Complete chromatic scale of musical notes in Western notation.
 * Starts from C and proceeds in semitone steps.
 * @readonly
 */
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

/**
 * Maps natural notes to their semitone offset from middle C (MIDI note 60).
 * Negative values indicate notes below middle C.
 * This mapping is used for MIDI note calculations and pitch relationships.
 * @readonly
 */
export const NOTE_OFFSETS: Record<string, number> = {
  C: -11,
  D: -9,
  E: -7,
  F: -6,
  G: -4,
  A: -2,
  B: 0,
} as const;
