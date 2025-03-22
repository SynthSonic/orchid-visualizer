import type { ChordType, NoteName } from "../../../types/chord.types";
import {
  generateVoicings,
  getVoicingsForNote,
  getFirstVoicingForNote,
  generateFirstVoicingMap,
  getVoicingsForQuality,
  getChordNotes,
} from "../voicingUtils";
import "@jest/globals";

describe("voicingUtils", () => {
  describe("generateVoicings", () => {
    it("should generate correct voicings for given base offset and intervals", () => {
      const baseOffset = 0; // C
      const intervals = [0, 4, 7]; // Major chord intervals
      const result = generateVoicings(baseOffset, intervals);
      expect(result).toEqual([
        0, 4, 7, 12, 16, 19, 24, 28, 31, 36, 40, 43, 48, 52, 55, 60,
      ]);
    });

    it("should not generate voicings above 60", () => {
      const result = generateVoicings(50, [0, 4, 7]);
      expect(Math.max(...result)).toBeLessThanOrEqual(60);
    });

    it("should handle empty intervals array", () => {
      const result = generateVoicings(0, []);
      expect(result).toEqual([]);
    });

    it("should generate correct octave patterns from different starting offsets", () => {
      // Test with C's offset (-11)
      const cVoicings = generateVoicings(-11, [0, 4, 7]);
      expect(cVoicings).toContain(-11); // Root
      expect(cVoicings).toContain(1); // One octave up
      expect(cVoicings).toContain(13); // Two octaves up

      // Test with G's offset (-4)
      const gVoicings = generateVoicings(-4, [0, 4, 7]);
      expect(gVoicings).toContain(-4); // Root
      expect(gVoicings).toContain(8); // One octave up
      expect(gVoicings).toContain(20); // Two octaves up
    });
  });

  describe("getVoicingsForNote", () => {
    it("should return correct voicings for C Major", () => {
      const result = getVoicingsForNote("C" as NoteName, "Major" as ChordType);
      expect(result).toContain(-11); // Root (C: -11)
      expect(result).toContain(-7); // Third (E: -7)
      expect(result).toContain(-4); // Fifth (G: -4)
    });

    it("should return correct voicings for all natural notes in Major", () => {
      const noteOffsets = {
        C: -11,
        D: -9,
        E: -7,
        F: -6,
        G: -4,
        A: -2,
        B: 0,
      };

      Object.entries(noteOffsets).forEach(([note, offset]) => {
        const result = getVoicingsForNote(
          note as NoteName,
          "Major" as ChordType,
        );
        expect(result[0]).toBe(offset); // First voicing should be the base offset
        expect(result).toContain(offset + 12); // Should include next octave
        expect(result).toContain(offset + 24); // Should include two octaves up
      });
    });

    it("should maintain correct intervals between notes", () => {
      const cMajor = getVoicingsForNote("C" as NoteName, "Major" as ChordType);
      const dMajor = getVoicingsForNote("D" as NoteName, "Major" as ChordType);
      const eMajor = getVoicingsForNote("E" as NoteName, "Major" as ChordType);

      // Verify the difference between consecutive notes is correct
      expect(dMajor[0]! - cMajor[0]!).toBe(2); // D is 2 semitones above C
      expect(eMajor[0]! - dMajor[0]!).toBe(2); // E is 2 semitones above D
    });

    it("should return empty array for invalid note", () => {
      const result = getVoicingsForNote("H" as NoteName, "Major" as ChordType);
      expect(result).toEqual([]);
    });

    it("should return empty array for invalid chord quality", () => {
      const result = getVoicingsForNote(
        "C" as NoteName,
        "Invalid" as ChordType,
      );
      expect(result).toEqual([]);
    });
  });

  describe("getFirstVoicingForNote", () => {
    it("should return first valid voicing for C Major", () => {
      const result = getFirstVoicingForNote(
        "C" as NoteName,
        "Major" as ChordType,
      );
      expect(result).not.toBeNull();
      expect(result).toBeLessThan(2);
    });

    it("should return null for invalid note", () => {
      const result = getFirstVoicingForNote(
        "H" as NoteName,
        "Major" as ChordType,
      );
      expect(result).toBeNull();
    });
  });

  describe("generateFirstVoicingMap", () => {
    it("should generate a map containing all whole notes", () => {
      const result = generateFirstVoicingMap();
      const expectedNotes: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];
      expectedNotes.forEach((note) => {
        expect(result).toHaveProperty(note);
      });
    });

    it("should have valid voicings for major chords", () => {
      const result = generateFirstVoicingMap();
      expect(result.C.Major).not.toBeNull();
    });

    it("should have all chord qualities for each note", () => {
      const result = generateFirstVoicingMap();
      const note = "C" as NoteName;
      expect(result[note]).toHaveProperty("Major");
      expect(result[note]).toHaveProperty("Minor");
      expect(result[note]).toHaveProperty("Diminished");
    });
  });

  describe("getVoicingsForQuality", () => {
    it("should return voicings for major quality", () => {
      const result = getVoicingsForQuality("Maj");
      expect(result).toHaveProperty("C");
      expect(Array.isArray(result.C)).toBe(true);
    });

    it("should default to major voicings for invalid quality", () => {
      const result = getVoicingsForQuality(
        "InvalidQuality" as "Maj" | "Min" | "Dim" | "Sus",
      );
      expect(result).toHaveProperty("C");
      const majorResult = getVoicingsForQuality("Maj");
      expect(result.C).toEqual(majorResult.C);
    });

    it("should return voicings for all natural notes", () => {
      const result = getVoicingsForQuality("Maj");
      ["C", "D", "E", "F", "G", "A", "B"].forEach((note) => {
        expect(result).toHaveProperty(note);
        expect(Array.isArray(result[note])).toBe(true);
      });
    });

    it("should return voicings starting at correct offsets for each note", () => {
      const result = getVoicingsForQuality("Maj");

      // Verify each note starts at its correct offset
      expect(result.C![0]).toBe(-11);
      expect(result.D![0]).toBe(-9);
      expect(result.E![0]).toBe(-7);
      expect(result.F![0]).toBe(-6);
      expect(result.G![0]).toBe(-4);
      expect(result.A![0]).toBe(-2);
      expect(result.B![0]).toBe(0);
    });

    it("should maintain correct octave patterns for each note", () => {
      const result = getVoicingsForQuality("Maj");

      Object.entries(result).forEach(([_note, voicings]) => {
        const baseOffset = voicings[0]!; // We know this exists from previous test
        expect(voicings).toContain(baseOffset + 12); // One octave up
        expect(voicings).toContain(baseOffset + 24); // Two octaves up
        expect(voicings).toContain(baseOffset + 36); // Three octaves up
      });
    });
  });

  describe("getChordNotes", () => {
    it("should return root position notes for C Major", () => {
      const voicings = getVoicingsForQuality("Maj").C ?? [];
      const result = getChordNotes("C", voicings[0], "Maj");
      expect(result).toBe("E G C");
    });

    it("should return first inversion notes for C Major", () => {
      const voicings = getVoicingsForQuality("Maj").C ?? [];
      const result = getChordNotes("C", voicings[1], "Maj");
      expect(result).toBe("G C E");
    });

    it("should return second inversion notes for C Major", () => {
      const voicings = getVoicingsForQuality("Maj").C ?? [];
      const result = getChordNotes("C", voicings[2], "Maj");
      expect(result).toBe("C E G");
    });

    it("should return empty string for undefined voicing", () => {
      expect(getChordNotes("C", undefined, "Maj")).toBe("");
    });

    it('should return "-" for invalid inputs', () => {
      expect(getChordNotes("H", 0, "Maj")).toBe("-");
      expect(
        getChordNotes(
          "C",
          0,
          "InvalidQuality" as "Maj" | "Min" | "Dim" | "Sus",
        ),
      ).toBe("-");
    });

    it("should handle null voicing", () => {
      expect(getChordNotes("C", undefined, "Maj")).toBe("");
    });

    it("should handle specific voicings correctly - G major voicing 24", () => {
      const result = getChordNotes("G", 24, "Maj");
      expect(result).toBe("D G B");
    });

    it("should handle specific voicings correctly - F minor voicing 37", () => {
      const result = getChordNotes("F", 37, "Min");
      expect(result).toBe("F G# C");
    });

    it("should handle specific voicings correctly - B diminished voicing 60", () => {
      const result = getChordNotes("B", 60, "Dim");
      expect(result).toBe("D F B");
    });

    it("should handle specific voicings correctly - D sus4 voicing 15", () => {
      const result = getChordNotes("D", 15, "Sus");
      expect(result).toBe("G A D");
    });
  });
});
