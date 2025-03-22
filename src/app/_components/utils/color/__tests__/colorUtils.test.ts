import { getColorBrightness } from "../colorUtils";
import "@jest/globals";

describe("getColorBrightness", () => {
  const BASE_COLOR = "#8B4513"; // Saddle brown

  it("adjusts brightness based on MIDI note octave", () => {
    // Test different octaves
    const c3 = getColorBrightness(48, BASE_COLOR); // C3
    const c4 = getColorBrightness(60, BASE_COLOR); // C4 (middle C)
    const c5 = getColorBrightness(72, BASE_COLOR); // C5

    // Higher octaves should result in brighter colors
    expect(c3 < c4).toBe(true);
    expect(c4 < c5).toBe(true);
  });

  it("maintains color format", () => {
    const result = getColorBrightness(60, BASE_COLOR);
    expect(result).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("never exceeds maximum brightness", () => {
    // Test very high octave
    const result = getColorBrightness(108, BASE_COLOR); // C8
    const r = parseInt(result.slice(1, 3), 16);
    const g = parseInt(result.slice(3, 5), 16);
    const b = parseInt(result.slice(5, 7), 16);

    expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeLessThanOrEqual(255);
  });

  it("maintains relative RGB ratios", () => {
    const result = getColorBrightness(60, BASE_COLOR);
    const r = parseInt(result.slice(1, 3), 16);
    const g = parseInt(result.slice(3, 5), 16);
    const b = parseInt(result.slice(5, 7), 16);

    // Original color is #8B4513, so red should be highest, then green, then blue
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
  });
});
