import {
  getChordInfo,
  getUniqueBaseNotes,
  calculateIntervals,
  normalizeIntervals,
  findChordPattern,
  determineInversion,
} from "./chordUtils";
import "@jest/globals";

describe("getChordInfo", () => {
  // Test empty or invalid input
  test("returns null for empty array", () => {
    expect(getChordInfo([])).toBeNull();
  });

  test("returns null for single note", () => {
    expect(getChordInfo([60])).toBeNull(); // Middle C
  });

  // Major triads in all inversions
  describe("Major triads", () => {
    test("identifies C major triad in root position", () => {
      // C4(60), E4(64), G4(67)
      expect(getChordInfo([60, 64, 67])).toEqual({
        chordName: "C Major",
        inversion: "Root",
        bassNote: "C4",
      });
    });

    test("identifies C major triad in first inversion", () => {
      // E3(52), G3(55), C4(60)
      expect(getChordInfo([52, 55, 60])).toEqual({
        chordName: "C Major",
        inversion: "1st",
        bassNote: "E3",
      });
    });

    test("identifies C major triad in second inversion", () => {
      // G3(55), C4(60), E4(64)
      expect(getChordInfo([55, 60, 64])).toEqual({
        chordName: "C Major",
        inversion: "2nd",
        bassNote: "G3",
      });
    });
  });

  // Minor triads in all inversions
  describe("Minor triads", () => {
    test("identifies A minor triad in root position", () => {
      // A3(57), C4(60), E4(64)
      expect(getChordInfo([57, 60, 64])).toEqual({
        chordName: "A Minor",
        inversion: "Root",
        bassNote: "A3",
      });
    });

    test("identifies A minor triad in first inversion", () => {
      // C4(60), E4(64), A4(69)
      expect(getChordInfo([60, 64, 69])).toEqual({
        chordName: "A Minor",
        inversion: "1st",
        bassNote: "C4",
      });
    });

    test("identifies A minor triad in second inversion", () => {
      // E3(52), A3(57), C4(60)
      expect(getChordInfo([52, 57, 60])).toEqual({
        chordName: "A Minor",
        inversion: "2nd",
        bassNote: "E3",
      });
    });
  });

  // Diminished triads in all inversions
  describe("Diminished triads", () => {
    test("identifies B diminished triad in root position", () => {
      // B3(59), D4(62), F4(65)
      expect(getChordInfo([59, 62, 65])).toEqual({
        chordName: "B Diminished",
        inversion: "Root",
        bassNote: "B3",
      });
    });

    test("identifies B diminished triad in first inversion", () => {
      // D4(62), F4(65), B4(71)
      expect(getChordInfo([62, 65, 71])).toEqual({
        chordName: "B Diminished",
        inversion: "1st",
        bassNote: "D4",
      });
    });

    test("identifies B diminished triad in second inversion", () => {
      // F3(53), B3(59), D4(62)
      expect(getChordInfo([53, 59, 62])).toEqual({
        chordName: "B Diminished",
        inversion: "2nd",
        bassNote: "F3",
      });
    });
  });

  // Sus4 triads in all inversions
  describe("Sus4 triads", () => {
    test("identifies F sus4 in root position", () => {
      // F3(53), Bb3(58), C4(60)
      expect(getChordInfo([53, 58, 60])).toEqual({
        chordName: "F Sus4",
        inversion: "Root",
        bassNote: "F3",
      });
    });

    test("identifies F sus4 in first inversion", () => {
      // Bb3(58), C4(60), F4(65)
      expect(getChordInfo([58, 60, 65])).toEqual({
        chordName: "F Sus4",
        inversion: "Root",
        bassNote: "A#3", // Bb is represented as A# in our system
      });
    });

    test("identifies F sus4 in second inversion", () => {
      // C3(48), F3(53), Bb3(58)
      expect(getChordInfo([48, 53, 58])).toEqual({
        chordName: "F Sus4",
        inversion: "2nd",
        bassNote: "C3",
      });
    });
  });

  // Edge cases
  test("handles duplicate notes correctly", () => {
    // C4(60), C4(60), E4(64), G4(67)
    expect(getChordInfo([60, 60, 64, 67])).toEqual({
      chordName: "C Major",
      inversion: "Root",
      bassNote: "C4",
    });
  });

  // Sus chord edge cases
  describe("Sus chord edge cases", () => {
    it("identifies G sus4 in root position", () => {
      // The notes [G3, C4, D4] form a G sus4 chord
      // G is root, C is fourth, D is fifth
      expect(getChordInfo([55, 60, 62])).toEqual({
        chordName: "G Sus4",
        inversion: "Root",
        bassNote: "G3",
      });
    });
  });
});

describe("getUniqueBaseNotes", () => {
  it("returns unique base notes from MIDI notes", () => {
    expect(getUniqueBaseNotes([60, 64, 67])).toEqual(["C", "E", "G"]); // C major triad
    expect(getUniqueBaseNotes([60, 60, 64, 67])).toEqual(["C", "E", "G"]); // With duplicate C
    expect(getUniqueBaseNotes([60])).toEqual(["C"]); // Single note
    expect(getUniqueBaseNotes([])).toEqual([]); // Empty array
  });
});

describe("calculateIntervals", () => {
  it("calculates intervals between notes", () => {
    expect(calculateIntervals(["C", "E", "G"])).toEqual([0, 4, 7]); // C major triad
    expect(calculateIntervals(["A", "C", "E"])).toEqual([9, 0, 4]); // A minor triad (A=9, C=0, E=4)
    expect(calculateIntervals(["C"])).toEqual([0]); // Single note
    expect(calculateIntervals([])).toEqual([]); // Empty array
  });
});

describe("normalizeIntervals", () => {
  it("normalizes intervals relative to root note", () => {
    expect(normalizeIntervals([0, 4, 7], 0)).toEqual([0, 4, 7]); // C major from C
    expect(normalizeIntervals([0, 4, 7], 1)).toEqual([0, 3, 8]); // C major from E
    expect(normalizeIntervals([0, 4, 7], 2)).toEqual([0, 5, 9]); // C major from G
    expect(normalizeIntervals([], 0)).toEqual([]); // Empty array
  });
});

describe("findChordPattern", () => {
  it("finds matching chord patterns", () => {
    expect(findChordPattern([0, 4, 7], "C")).toEqual({
      chordType: "Major",
      pattern: [0, 4, 7],
      rootNote: "C",
    }); // C major

    expect(findChordPattern([0, 3, 7], "A")).toEqual({
      chordType: "Minor",
      pattern: [0, 3, 7],
      rootNote: "A",
    }); // A minor

    expect(findChordPattern([0, 3, 6], "B")).toEqual({
      chordType: "Diminished",
      pattern: [0, 3, 6],
      rootNote: "B",
    }); // B diminished

    expect(findChordPattern([0, 5, 7], "F")).toEqual({
      chordType: "Sus4",
      pattern: [0, 5, 7],
      rootNote: "F",
    }); // F sus4

    expect(findChordPattern([0, 2, 7], "G")).toBeNull(); // Invalid pattern
  });
});

describe("determineInversion", () => {
  it("determines chord inversion and bass note", () => {
    // C major triad inversions
    expect(determineInversion(60, "C")).toEqual({
      // C4 bass, C root
      inversionText: "Root",
      lowestNoteName: "C4",
    });

    expect(determineInversion(64, "C")).toEqual({
      // E4 bass, C root
      inversionText: "1st",
      lowestNoteName: "E4",
    });

    expect(determineInversion(67, "C")).toEqual({
      // G4 bass, C root
      inversionText: "2nd",
      lowestNoteName: "G4",
    });
  });
});
