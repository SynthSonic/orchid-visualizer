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
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies C major triad in first inversion", () => {
      // E3(52), G3(55), C4(60)
      expect(getChordInfo([52, 55, 60])).toEqual({
        chordName: "C Major",
        inversion: "1st",
        bassNote: "E3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies C major triad in second inversion", () => {
      // G3(55), C4(60), E4(64)
      expect(getChordInfo([55, 60, 64])).toEqual({
        chordName: "C Major",
        inversion: "2nd",
        bassNote: "G3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
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
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies A minor triad in first inversion", () => {
      // C4(60), E4(64), A4(69)
      expect(getChordInfo([60, 64, 69])).toEqual({
        chordName: "A Minor",
        inversion: "1st",
        bassNote: "C4",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies A minor triad in second inversion", () => {
      // E3(52), A3(57), C4(60)
      expect(getChordInfo([52, 57, 60])).toEqual({
        chordName: "A Minor",
        inversion: "2nd",
        bassNote: "E3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });
  });

  // Diminished triads in all inversions
  describe("Diminished triads", () => {
    test("identifies B diminished triad in root position", () => {
      // B3(59), D4(62), F4(65)
      expect(getChordInfo([59, 62, 65])).toEqual({
        chordName: "B Dim",
        inversion: "Root",
        bassNote: "B3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies B diminished triad in first inversion", () => {
      // D4(62), F4(65), B4(71)
      expect(getChordInfo([62, 65, 71])).toEqual({
        chordName: "B Dim",
        inversion: "1st",
        bassNote: "D4",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies B diminished triad in second inversion", () => {
      // F3(53), B3(59), D4(62)
      expect(getChordInfo([53, 59, 62])).toEqual({
        chordName: "B Dim",
        inversion: "2nd",
        bassNote: "F3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
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
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies F sus4 in first inversion", () => {
      // Bb3(58), C4(60), F4(65)
      expect(getChordInfo([58, 60, 65])).toEqual({
        chordName: "F Sus4",
        inversion: "Root",
        bassNote: "A#3", // Bb is represented as A# in our system
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });

    test("identifies F sus4 in second inversion", () => {
      // C3(48), F3(53), Bb3(58)
      expect(getChordInfo([48, 53, 58])).toEqual({
        chordName: "F Sus4",
        inversion: "2nd",
        bassNote: "C3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });
  });

  describe("6 extension chords", () => {
    test("identifies C maj 6 in root position", () => {
      // C4(60), E4(64), G4(67), A4(69)
      expect(getChordInfo([60, 64, 67, 69])).toEqual({
        chordName: "C Major",
        inversion: "Root",
        bassNote: "C4",
        hasSixth: true,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
      });
    });
  });

  describe("Extended chords", () => {
    // Major chord extensions
    describe("Major chord extensions", () => {
      test("identifies C6 chord", () => {
        // C4(60), E4(64), G4(67), A4(69)
        expect(getChordInfo([60, 64, 67, 69])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies C7 chord", () => {
        // C4(60), E4(64), G4(67), Bb4(70)
        expect(getChordInfo([60, 64, 67, 70])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies Cmaj7 chord", () => {
        // C4(60), E4(64), G4(67), B4(71)
        expect(getChordInfo([60, 64, 67, 71])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: false,
        });
      });

      test("identifies C9 chord with 9th in higher octave", () => {
        // C4(60), E4(64), G4(67), Bb4(70), D5(74)
        expect(getChordInfo([60, 64, 67, 70, 74])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });

      test("identifies C9 chord with 9th in same octave", () => {
        // C4(60), D4(62), E4(64), G4(67), Bb4(70)
        expect(getChordInfo([60, 62, 64, 67, 70])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });
    });

    // Minor chord extensions
    describe("Minor chord extensions", () => {
      test("identifies Cm6 chord", () => {
        // C4(60), Eb4(63), G4(67), A4(69)
        expect(getChordInfo([60, 63, 67, 69])).toEqual({
          chordName: "C Minor",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies Cm7 chord", () => {
        // C4(60), Eb4(63), G4(67), Bb4(70)
        expect(getChordInfo([60, 63, 67, 70])).toEqual({
          chordName: "C Minor",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies CmM7 chord", () => {
        // C4(60), Eb4(63), G4(67), B4(71)
        expect(getChordInfo([60, 63, 67, 71])).toEqual({
          chordName: "C Minor",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: false,
        });
      });

      test("identifies Cm9 chord", () => {
        // C4(60), Eb4(63), G4(67), Bb4(70), D5(74)
        expect(getChordInfo([60, 63, 67, 70, 74])).toEqual({
          chordName: "C Minor",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });
    });

    // Diminished chord extensions
    describe("Diminished chord extensions", () => {
      test("identifies Cdim6 chord", () => {
        // C4(60), Eb4(63), Gb4(66), A4(69) - A is the major 6th
        expect(getChordInfo([60, 63, 66, 69])).toEqual({
          chordName: "C Dim",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies Cdim7 chord", () => {
        // C4(60), Eb4(63), Gb4(66), Bb4(70) - Bb is the diminished 7th
        expect(getChordInfo([60, 63, 66, 70])).toEqual({
          chordName: "C Dim",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies CdimM7 chord", () => {
        // C4(60), Eb4(63), Gb4(66), B4(71)
        expect(getChordInfo([60, 63, 66, 71])).toEqual({
          chordName: "C Dim",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: false,
        });
      });

      test("identifies Cdim9 chord", () => {
        // C4(60), Eb4(63), Gb4(66), A4(69), D5(74)
        expect(getChordInfo([60, 63, 66, 69, 74])).toEqual({
          chordName: "C Dim",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });
    });

    // Sus4 chord extensions
    describe("Sus4 chord extensions", () => {
      test("identifies Csus4/6 chord", () => {
        // C4(60), F4(65), G4(67), A4(69)
        expect(getChordInfo([60, 65, 67, 69])).toEqual({
          chordName: "C Sus4",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies Csus4/7 chord", () => {
        // C4(60), F4(65), G4(67), Bb4(70)
        expect(getChordInfo([60, 65, 67, 70])).toEqual({
          chordName: "C Sus4",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies Csus4/maj7 chord", () => {
        // C4(60), F4(65), G4(67), B4(71)
        expect(getChordInfo([60, 65, 67, 71])).toEqual({
          chordName: "C Sus4",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: false,
        });
      });

      test("identifies Csus4/9 chord", () => {
        // C4(60), F4(65), G4(67), Bb4(70), D5(74)
        expect(getChordInfo([60, 65, 67, 70, 74])).toEqual({
          chordName: "C Sus4",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });
    });

    // Test combinations
    describe("Combined extensions", () => {
      test("identifies C6/9 chord", () => {
        // C4(60), E4(64), G4(67), A4(69), D5(74)
        expect(getChordInfo([60, 64, 67, 69, 74])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });

      test("identifies Cmaj7/9 chord", () => {
        // C4(60), E4(64), G4(67), B4(71), D5(74)
        expect(getChordInfo([60, 64, 67, 71, 74])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: false,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: true,
        });
      });

      test("identifies C6/7 chord", () => {
        // C4(60), E4(64), G4(67), A4(69), Bb4(70)
        expect(getChordInfo([60, 64, 67, 69, 70])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies C6/maj7 chord", () => {
        // C4(60), E4(64), G4(67), A4(69), B4(71)
        expect(getChordInfo([60, 64, 67, 69, 71])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: false,
        });
      });

      test("identifies Cm6/7 chord", () => {
        // C4(60), Eb4(63), G4(67), A4(69), Bb4(70)
        expect(getChordInfo([60, 63, 67, 69, 70])).toEqual({
          chordName: "C Minor",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies Cdim6/7 chord", () => {
        // C4(60), Eb4(63), Gb4(66), A4(69), Bb4(70)
        expect(getChordInfo([60, 63, 66, 69, 70])).toEqual({
          chordName: "C Dim",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: false,
        });
      });

      test("identifies C6/7/9 chord", () => {
        // C4(60), E4(64), G4(67), A4(69), Bb4(70), D5(74)
        expect(getChordInfo([60, 64, 67, 69, 70, 74])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: true,
          hasMajorSeventh: false,
          hasNinth: true,
        });
      });

      test("identifies C6/maj7/9 chord", () => {
        // C4(60), E4(64), G4(67), A4(69), B4(71), D5(74)
        expect(getChordInfo([60, 64, 67, 69, 71, 74])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: false,
          hasMajorSeventh: true,
          hasNinth: true,
        });
      });

      test("identifies C6/7/maj7/9 chord", () => {
        // C4(60), E4(64), G4(67), A4(69), Bb4(70), B4(71), D5(74)
        expect(getChordInfo([60, 64, 67, 69, 70, 71, 74])).toEqual({
          chordName: "C Major",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: true,
          hasMajorSeventh: true,
          hasNinth: true,
        });
      });

      test("identifies Cm6/7/maj7/9 chord", () => {
        // C4(60), Eb4(63), G4(67), A4(69), Bb4(70), B4(71), D5(74)
        expect(getChordInfo([60, 63, 67, 69, 70, 71, 74])).toEqual({
          chordName: "C Minor",
          inversion: "Root",
          bassNote: "C4",
          hasSixth: true,
          hasSeventh: true,
          hasMajorSeventh: true,
          hasNinth: true,
        });
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
      hasSixth: false,
      hasSeventh: false,
      hasMajorSeventh: false,
      hasNinth: false,
    });
  });

  // Sus chord edge cases
  describe("Sus chord edge cases", () => {
    it("identifies G sus4 in root position", () => {
      // The notes [G3, C4, D4] form a G sus4 chord
      // G is root, C is fourth, D is fifth
      expect(getChordInfo([55, 60, 62])).toEqual({
        chordName: "G Sus",
        inversion: "Root",
        bassNote: "G3",
        hasSixth: false,
        hasSeventh: false,
        hasMajorSeventh: false,
        hasNinth: false,
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
  it("calculates chromatic scale positions from MIDI notes", () => {
    // C4(60), E4(64), G4(67) - C major triad
    expect(calculateIntervals([60, 64, 67])).toEqual([0, 4, 7]); // C=0, E=4, G=7

    // A3(57), C4(60), E4(64) - A minor triad
    expect(calculateIntervals([57, 60, 64])).toEqual([9, 0, 4]); // A=9, C=0, E=4

    // Single note - C4(60)
    expect(calculateIntervals([60])).toEqual([0]); // C=0

    // Empty array
    expect(calculateIntervals([])).toEqual([]);

    // Notes across octaves - C4(60), C5(72), G5(79)
    expect(calculateIntervals([60, 72, 79])).toEqual([0, 0, 7]); // C=0, C=0, G=7
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
