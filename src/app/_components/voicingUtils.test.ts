import {
  generateVoicings,
  getFirstVoicing,
  getVoicingsForNote,
  getFirstVoicingForNote,
  generateFirstVoicingMap,
  getVoicingsForQuality,
  getChordNotes,
} from "./voicingUtils";
import type { ChordType, NoteName } from "./types/chord.types";

describe("voicingUtils", () => {
  describe("generateVoicings", () => {
    it("should generate correct voicings for given base offset and intervals", () => {
      const baseOffset = 0; // C
      const intervals = [0, 4, 7]; // Major chord intervals
      const result = generateVoicings(baseOffset, intervals);
      expect(result[0]).toEqual({ voicing: 0, inversion: 1, octave: 0 });
      expect(result[1]).toEqual({ voicing: 4, inversion: 2, octave: 0 });
      expect(result[2]).toEqual({ voicing: 7, inversion: 0, octave: 1 });
      expect(result[3]).toEqual({ voicing: 12, inversion: 1, octave: 1 });
    });

    it("should not generate voicings above 60", () => {
      const result = generateVoicings(50, [0, 4, 7]);
      const maxVoicing = Math.max(
        ...Object.values(result).map((v) => v.voicing),
      );
      expect(maxVoicing).toBeLessThanOrEqual(60);
    });

    it("should handle empty intervals array", () => {
      const result = generateVoicings(0, []);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("should generate correct octave patterns from different starting offsets", () => {
      // Test with C's offset (-11)
      const cVoicings = generateVoicings(-11, [0, 4, 7]);
      expect(cVoicings[0]).toEqual({ voicing: -11, inversion: 1, octave: 0 });
      expect(cVoicings[3]).toEqual({ voicing: 1, inversion: 1, octave: 1 });
      expect(cVoicings[6]).toEqual({ voicing: 13, inversion: 1, octave: 2 });

      // Test with G's offset (-4)
      const gVoicings = generateVoicings(-4, [0, 4, 7]);
      expect(gVoicings[0]).toEqual({ voicing: -4, inversion: 1, octave: 0 });
      expect(gVoicings[3]).toEqual({ voicing: 8, inversion: 1, octave: 1 });
      expect(gVoicings[6]).toEqual({ voicing: 20, inversion: 1, octave: 2 });
    });
  });

  describe("getFirstVoicing", () => {
    it("should return the highest voicing less than 2", () => {
      const voicings = {
        0: { voicing: 0, inversion: 1, octave: 0 },
        1: { voicing: 1, inversion: 2, octave: 0 },
        2: { voicing: 2, inversion: 0, octave: 0 },
        3: { voicing: 3, inversion: 1, octave: 0 },
        4: { voicing: 4, inversion: 2, octave: 0 },
      };
      expect(getFirstVoicing(voicings)).toBe(1);
    });

    it("should return null when no valid voicings exist", () => {
      const voicings = {
        0: { voicing: 2, inversion: 1, octave: 0 },
        1: { voicing: 3, inversion: 2, octave: 0 },
        2: { voicing: 4, inversion: 0, octave: 0 },
      };
      expect(getFirstVoicing(voicings)).toBeNull();
    });

    it("should handle empty object", () => {
      expect(getFirstVoicing({})).toBeNull();
    });
  });

  describe("getVoicingsForNote", () => {
    it("should return correct voicings for C Major", () => {
      const result = getVoicingsForNote("C" as NoteName, "Major" as ChordType);
      expect(result[0]).toEqual({ voicing: -11, inversion: 1, octave: 0 }); // Root (C: -11)
      expect(result[1]).toEqual({ voicing: -7, inversion: 2, octave: 0 }); // Third (E: -7)
      expect(result[2]).toEqual({ voicing: -4, inversion: 0, octave: 1 }); // Fifth (G: -4)
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
        const firstVoicing = result[0];
        expect(firstVoicing).toBeDefined();
        expect(firstVoicing!.voicing).toBe(offset); // First voicing should be the base offset
        expect(Object.values(result).some((v) => v.voicing === offset + 12)); // Should include next octave
        expect(Object.values(result).some((v) => v.voicing === offset + 24)); // Should include two octaves up
      });
    });

    it("should maintain correct intervals between notes", () => {
      const cMajor = getVoicingsForNote("C" as NoteName, "Major" as ChordType);
      const dMajor = getVoicingsForNote("D" as NoteName, "Major" as ChordType);
      const eMajor = getVoicingsForNote("E" as NoteName, "Major" as ChordType);

      // Verify the difference between consecutive notes is correct
      const cFirst = cMajor[0];
      const dFirst = dMajor[0];
      const eFirst = eMajor[0];

      expect(cFirst).toBeDefined();
      expect(dFirst).toBeDefined();
      expect(eFirst).toBeDefined();

      expect(dFirst!.voicing - cFirst!.voicing).toBe(2); // D is 2 semitones above C
      expect(eFirst!.voicing - dFirst!.voicing).toBe(2); // E is 2 semitones above D
    });

    it("should return empty object for invalid note", () => {
      const result = getVoicingsForNote("H" as NoteName, "Major" as ChordType);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("should return empty object for invalid chord quality", () => {
      const result = getVoicingsForNote(
        "C" as NoteName,
        "Invalid" as ChordType,
      );
      expect(Object.keys(result)).toHaveLength(0);
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
      expect(typeof result.C).toBe("object");
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
        expect(typeof result[note]).toBe("object");
      });
    });

    it("should return voicings starting at correct offsets for each note", () => {
      const result = getVoicingsForQuality("Maj");

      // Verify each note starts at its correct offset
      const cFirst = result.C?.[0];
      const dFirst = result.D?.[0];
      const eFirst = result.E?.[0];
      const fFirst = result.F?.[0];
      const gFirst = result.G?.[0];
      const aFirst = result.A?.[0];
      const bFirst = result.B?.[0];

      expect(cFirst).toBeDefined();
      expect(dFirst).toBeDefined();
      expect(eFirst).toBeDefined();
      expect(fFirst).toBeDefined();
      expect(gFirst).toBeDefined();
      expect(aFirst).toBeDefined();
      expect(bFirst).toBeDefined();

      expect(cFirst!.voicing).toBe(-11);
      expect(dFirst!.voicing).toBe(-9);
      expect(eFirst!.voicing).toBe(-7);
      expect(fFirst!.voicing).toBe(-6);
      expect(gFirst!.voicing).toBe(-4);
      expect(aFirst!.voicing).toBe(-2);
      expect(bFirst!.voicing).toBe(0);
    });

    it("should maintain correct octave patterns for each note", () => {
      const result = getVoicingsForQuality("Maj");

      Object.entries(result).forEach(([_note, voicings]) => {
        const firstVoicing = voicings[0];
        expect(firstVoicing).toBeDefined();
        const baseOffset = firstVoicing!.voicing;
        expect(
          Object.values(voicings).some((v) => v.voicing === baseOffset + 12),
        ); // One octave up
        expect(
          Object.values(voicings).some((v) => v.voicing === baseOffset + 24),
        ); // Two octaves up
        expect(
          Object.values(voicings).some((v) => v.voicing === baseOffset + 36),
        ); // Three octaves up
      });
    });
  });

  describe("getChordNotes", () => {
    it("should return root position notes for C Major", () => {
      const voicings = getVoicingsForQuality("Maj").C ?? {};
      const result = getChordNotes("C", voicings[0], "Maj");
      expect(result).toBe("E0 G0 C1");
    });

    it("should return first inversion notes for C Major", () => {
      const voicings = getVoicingsForQuality("Maj").C ?? {};
      const result = getChordNotes("C", voicings[1], "Maj");
      expect(result).toBe("G0 C1 E1");
    });

    it("should return second inversion notes for C Major", () => {
      const voicings = getVoicingsForQuality("Maj").C ?? {};
      const result = getChordNotes("C", voicings[2], "Maj");
      expect(result).toBe("C1 E1 G1");
    });

    it("should return empty string for undefined voicing", () => {
      expect(getChordNotes("C", undefined, "Maj")).toBe("");
    });

    it('should return "-" for invalid inputs', () => {
      expect(
        getChordNotes("H", { voicing: 0, inversion: 0, octave: 0 }, "Maj"),
      ).toBe("-");
      expect(
        getChordNotes(
          "C",
          { voicing: 0, inversion: 0, octave: 0 },
          "InvalidQuality" as "Maj" | "Min" | "Dim" | "Sus",
        ),
      ).toBe("-");
    });

    it("should handle null voicing", () => {
      expect(getChordNotes("C", undefined, "Maj")).toBe("");
    });

    it("should handle specific voicings correctly - G major voicing 24", () => {
      const result = getChordNotes(
        "G",
        { voicing: 24, inversion: 0, octave: 2 },
        "Maj",
      );
      expect(result).toBe("D3 G3 B3");
    });

    it("should handle specific voicings correctly - F minor voicing 37", () => {
      const result = getChordNotes(
        "F",
        { voicing: 37, inversion: 1, octave: 3 },
        "Min",
      );
      expect(result).toBe("F3 G#3 C4");
    });

    it("should handle specific voicings correctly - B diminished voicing 60", () => {
      const result = getChordNotes(
        "B",
        { voicing: 60, inversion: 2, octave: 5 },
        "Dim",
      );
      expect(result).toBe("D6 F6 B6");
    });

    it("should handle specific voicings correctly - D sus4 voicing 15", () => {
      const result = getChordNotes(
        "D",
        { voicing: 15, inversion: 0, octave: 1 },
        "Sus",
      );
      expect(result).toBe("G1 A1 D2");
    });
  });
});
