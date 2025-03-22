import {
  getMIDINoteName,
  getBaseNoteName,
  parseMIDIMessage,
} from "../midiUtils";
import "@jest/globals";

describe("getMIDINoteName", () => {
  it("converts MIDI note numbers to note names with octaves", () => {
    expect(getMIDINoteName(60)).toBe("C4"); // Middle C
    expect(getMIDINoteName(61)).toBe("C#4");
    expect(getMIDINoteName(62)).toBe("D4");
    expect(getMIDINoteName(72)).toBe("C5"); // C one octave up
    expect(getMIDINoteName(48)).toBe("C3"); // C one octave down
  });
});

describe("getBaseNoteName", () => {
  it("gets base note names without octaves", () => {
    expect(getBaseNoteName(60)).toBe("C"); // Middle C
    expect(getBaseNoteName(61)).toBe("C#");
    expect(getBaseNoteName(62)).toBe("D");
    expect(getBaseNoteName(72)).toBe("C"); // C in any octave
    expect(getBaseNoteName(48)).toBe("C"); // C in any octave
  });
});

describe("parseMIDIMessage", () => {
  it("parses note-on messages", () => {
    const data = new Uint8Array([0x90, 60, 100]); // Note-on, middle C, velocity 100
    const result = parseMIDIMessage(data, 1000);
    expect(result).toEqual({
      timestamp: 1000,
      channel: 1,
      type: "note-on",
      noteNumber: 60,
      noteName: "C4",
      velocity: 100,
      controlNumber: undefined,
      controlValue: undefined,
      programNumber: undefined,
      rawData: [0x90, 60, 100],
    });
  });

  it("parses note-off messages", () => {
    const data = new Uint8Array([0x80, 60, 0]); // Note-off, middle C, velocity 0
    const result = parseMIDIMessage(data, 1000);
    expect(result).toEqual({
      timestamp: 1000,
      channel: 1,
      type: "note-off",
      noteNumber: 60,
      noteName: "C4",
      velocity: 0,
      controlNumber: undefined,
      controlValue: undefined,
      programNumber: undefined,
      rawData: [0x80, 60, 0],
    });
  });

  it("parses note-on with zero velocity as note-off", () => {
    const data = new Uint8Array([0x90, 60, 0]); // Note-on, middle C, velocity 0
    const result = parseMIDIMessage(data, 1000);
    expect(result?.type).toBe("note-off");
  });

  it("parses control change messages", () => {
    const data = new Uint8Array([0xb0, 7, 100]); // Control change, volume, value 100
    const result = parseMIDIMessage(data, 1000);
    expect(result).toEqual({
      timestamp: 1000,
      channel: 1,
      type: "control-change",
      noteNumber: undefined,
      noteName: undefined,
      velocity: undefined,
      controlNumber: 7,
      controlValue: 100,
      programNumber: undefined,
      rawData: [0xb0, 7, 100],
    });
  });

  it("parses program change messages", () => {
    const data = new Uint8Array([0xc0, 5]); // Program change, program 5
    const result = parseMIDIMessage(data, 1000);
    expect(result).toEqual({
      timestamp: 1000,
      channel: 1,
      type: "program-change",
      noteNumber: undefined,
      noteName: undefined,
      velocity: undefined,
      controlNumber: undefined,
      controlValue: undefined,
      programNumber: 5,
      rawData: [0xc0, 5],
    });
  });

  it("handles invalid messages", () => {
    expect(parseMIDIMessage(new Uint8Array([]), 1000)).toBeNull();
    expect(parseMIDIMessage(new Uint8Array([0x90]), 1000)).toBeNull(); // Incomplete note-on
    expect(parseMIDIMessage(new Uint8Array([0x80]), 1000)).toBeNull(); // Incomplete note-off
  });
});
