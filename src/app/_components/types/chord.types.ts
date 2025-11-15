/**
 * @fileoverview Type definitions for musical chord structures and MIDI interactions.
 * Contains TypeScript types that define the shape of chord-related data structures
 * and MIDI message formats used throughout the application.
 */

import type {
  CHORD_DEFINITIONS,
  BASE_NOTES,
} from "../constants/chord.constants";

/**
 * Represents a musical note name from the chromatic scale (e.g., "C", "C#", etc.).
 * Derived from the BASE_NOTES constant to ensure type safety.
 */
export type NoteName = (typeof BASE_NOTES)[number];

/**
 * Defines the structure of a musical chord, including its naming and interval pattern.
 * @interface
 * @property {string} fullName - The complete name of the chord (e.g., "Major", "Minor")
 * @property {string} shortName - Abbreviated chord notation (e.g., "Maj", "Min")
 * @property {readonly number[]} intervals - Semitone intervals from the root note that define the chord
 * @property {string} description - Human-readable description of the chord structure
 */
export interface ChordDefinition {
  fullName: string;
  shortName: string;
  intervals: readonly number[];
  description: string;
}

/**
 * Available chord types in the application, derived from CHORD_DEFINITIONS.
 * @example "Major" | "Minor" | "Diminished" | "Sus4"
 */
export type ChordType = keyof typeof CHORD_DEFINITIONS;

/**
 * Short-form chord names, derived from the shortName property of CHORD_DEFINITIONS.
 * @example "Maj" | "Min" | "Dim" | "Sus"
 */
export type ChordShortName = (typeof CHORD_DEFINITIONS)[ChordType]["shortName"];

/**
 * Represents the arrangement of notes in a chord inversion.
 * Array of numbers indicating the reordering of chord tones.
 */
export type Inversion = number[];

/**
 * Contains information about a specific chord instance.
 * @interface
 * @property {string} chordName - The complete name of the chord including root note
 * @property {string} inversion - Description of the chord's inversion state
 * @property {string} bassNote - The lowest note in the chord (may differ from root in inversions)
 */
export interface ChordInfo {
  chordName: string;
  inversion: string;
  bassNote: string;
  hasSixth: boolean;
  hasSeventh: boolean;
  hasMajorSeventh: boolean;
  hasNinth: boolean;
}

/**
 * Standard MIDI message types supported by the application.
 * Follows the MIDI 1.0 specification for message categories.
 */
export type MIDIMessageType =
  | "note-on"
  | "note-off"
  | "control-change"
  | "program-change"
  | "unknown";

/**
 * Represents a complete MIDI message with all possible parameters.
 * @interface
 * @property {number} timestamp - When the MIDI message was received (in milliseconds)
 * @property {number} channel - MIDI channel number (0-15)
 * @property {MIDIMessageType} type - Type of MIDI message
 * @property {number} [noteNumber] - MIDI note number (0-127, optional)
 * @property {string} [noteName] - Musical note name (e.g., "C4", optional)
 * @property {number} [velocity] - Note velocity/intensity (0-127, optional)
 * @property {number} [controlNumber] - MIDI control change number (0-127, optional)
 * @property {number} [controlValue] - Value for control change (0-127, optional)
 * @property {number} [programNumber] - Program/patch number (0-127, optional)
 * @property {number[]} rawData - Raw MIDI message data bytes
 */
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

/**
 * Performance modes available on the Orchid device.
 */
export type PerformanceMode =
  | "Strum"
  | "Strum 2 octaves"
  | "Slop"
  | "Arpeggiate"
  | "Arp 2 octaves"
  | "Pattern"
  | "Harp";

/**
 * FX types available on the Orchid device.
 */
export type FXType =
  | "Reverb"
  | "Phaser"
  | "Chorus"
  | "Tremolo"
  | "Delay"
  | "Ensemble"
  | "Drive";

/**
 * Drum loop options available on the Orchid device.
 */
export type DrumLoop =
  | "Saint Germain"
  | "Orchid Bossanova"
  | "Trap"
  | "Disco"
  | "Old Skool"
  | "Techno"
  | "Latin"
  | "Millionaire"
  | "Bronson"
  | "North Soul"
  | "Back Beat"
  | "Apartment";

/**
 * Reverb type for Drum FX.
 */
export type ReverbType = 1 | 2 | 3;

/**
 * Saturator type for Drum FX.
 */
export type SaturatorType = 1 | 2 | 3;

/**
 * Individual FX setting with type and value.
 */
export interface FXSetting {
  type: FXType;
  value: number; // 0 (off) to 10
}

/**
 * Drum FX settings.
 */
export interface DrumFXSettings {
  reverbType?: ReverbType;
  reverbMix?: number; // 0 (off) to 10
  saturatorType?: SaturatorType;
  saturatorMix?: number; // 0 (off) to 10
}

/**
 * Additional Orchid settings that can be manually added to a chord snapshot.
 */
export interface OrchidSettings {
  title?: string; // Optional PDF title
  sound?: number; // 1-60
  voicing?: number; // 0-60
  performance?: PerformanceMode;
  performanceValue?: number; // 0-15
  fx?: FXSetting[]; // Max 3
  filter?: number; // 0 (off) to 10
  drumFX?: DrumFXSettings;
  bpm?: number; // Up to 200
  drumLoop?: DrumLoop;
}
