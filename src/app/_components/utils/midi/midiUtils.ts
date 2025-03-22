import type {
  MIDIMessage,
  MIDIMessageType,
  NoteName,
} from "../../types/chord.types";
import { BASE_NOTES } from "../../constants/chord.constants";

/**
 * Converts a MIDI note number to a note name with octave
 */
export const getMIDINoteName = (midiNote: number): string => {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${BASE_NOTES[noteIndex] ?? "C"}${octave}`;
};

/**
 * Gets the base note name without octave from a MIDI note number
 */
export const getBaseNoteName = (midiNote: number): NoteName => {
  const noteIndex = midiNote % 12;
  return BASE_NOTES[noteIndex] ?? "C";
};

/**
 * Parses raw MIDI message data into a structured format
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
    case 9: {
      // Note-on
      if (data.length < 3) return null;
      const velocityByte = data[2]!;
      const noteNumberByte = data[1]!;
      type = velocityByte > 0 ? "note-on" : "note-off";
      noteNumber = noteNumberByte;
      noteName = getMIDINoteName(noteNumberByte);
      velocity = velocityByte;
      break;
    }
    case 8: {
      // Note-off
      if (data.length < 3) return null;
      const noteNumberByte = data[1]!;
      const velocityByte = data[2]!;
      type = "note-off";
      noteNumber = noteNumberByte;
      noteName = getMIDINoteName(noteNumberByte);
      velocity = velocityByte;
      break;
    }
    case 11: {
      // Control change
      if (data.length < 3) return null;
      const controlNumberByte = data[1]!;
      const controlValueByte = data[2]!;
      type = "control-change";
      controlNumber = controlNumberByte;
      controlValue = controlValueByte;
      break;
    }
    case 12: {
      // Program change
      if (data.length < 2) return null;
      const programNumberByte = data[1]!;
      type = "program-change";
      programNumber = programNumberByte;
      break;
    }
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
