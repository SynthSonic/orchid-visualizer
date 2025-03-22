/**
 * Adjusts color brightness based on MIDI note number
 * @param midiNote - MIDI note number
 * @param baseColor - Base color in hex format
 * @returns Adjusted color in hex format
 */
export const getColorBrightness = (
  midiNote: number,
  baseColor: string,
): string => {
  const octave = Math.floor(midiNote / 12) - 2;
  const baseColorInt = parseInt(baseColor.slice(1), 16);
  const r = (baseColorInt >> 16) & 255;
  const g = (baseColorInt >> 8) & 255;
  const b = baseColorInt & 255;

  // Increase brightness based on octave (0-7 range typically for MIDI)
  const brightnessMultiplier = 1 + octave * 0.3; // 30% brighter per octave

  const newR = Math.min(255, Math.round(r * brightnessMultiplier));
  const newG = Math.min(255, Math.round(g * brightnessMultiplier));
  const newB = Math.min(255, Math.round(b * brightnessMultiplier));

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};
