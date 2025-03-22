"use client";

import React, { useState } from "react";
import type { NoteName } from "../_components/types/chord.types";
import {
  getFirstVoicing,
  getChordNotes,
  getVoicingsForQuality,
} from "../_components/chordUtils";

type ChordQuality = "Dim" | "Min" | "Maj" | "Sus";

const WHOLE_NOTES: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

const VoicingsPage: React.FC = () => {
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>("Maj");
  const voicings = getVoicingsForQuality(selectedQuality);

  // Find the maximum number of voicings across all notes
  const maxVoicings = Math.max(
    ...WHOLE_NOTES.map((note) => (voicings[note] ?? []).length),
  );

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-old-standard text-3xl font-bold italic">
          Chord Voicings
        </h1>

        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Select Chord Quality
          </label>
          <div className="inline-flex rounded-lg bg-[#1a1a1a] p-1">
            {(["Dim", "Min", "Maj", "Sus"] as ChordQuality[]).map((quality) => (
              <button
                key={quality}
                onClick={() => setSelectedQuality(quality)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedQuality === quality
                    ? "bg-[#8B4513] text-white"
                    : "text-gray-400 hover:bg-[#222] hover:text-white"
                }`}
              >
                {quality === "Dim"
                  ? "Diminished"
                  : quality === "Min"
                    ? "Minor"
                    : quality === "Maj"
                      ? "Major"
                      : "Suspended"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full bg-[#1a1a1a]">
            <thead>
              <tr className="bg-[#111]">
                {WHOLE_NOTES.map((note) => (
                  <th
                    key={note}
                    className="w-24 px-6 py-4 text-left text-sm font-bold text-gray-400"
                  >
                    {note}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxVoicings }, (_, i) => {
                const firstVoicings = WHOLE_NOTES.map((note) =>
                  getFirstVoicing(voicings[note] ?? []),
                );

                return (
                  <tr
                    key={i}
                    className="border-t border-gray-700 transition-colors hover:bg-[#222]"
                  >
                    {WHOLE_NOTES.map((note, noteIndex) => {
                      const voicing = voicings[note]?.[i];
                      const firstVoicing = firstVoicings[noteIndex] ?? null;
                      const isFirstVoicing = voicing === firstVoicing;
                      const shouldShowDash =
                        voicing !== undefined &&
                        firstVoicing !== null &&
                        voicing < firstVoicing;

                      return (
                        <td
                          key={note}
                          className={`w-24 px-6 py-4 font-mono ${
                            isFirstVoicing
                              ? "font-medium text-[#8B4513]"
                              : "text-gray-300"
                          }`}
                        >
                          {shouldShowDash ? (
                            "-"
                          ) : (
                            <div>
                              {isFirstVoicing ? (
                                <strong>1</strong>
                              ) : (
                                (voicing ?? "-")
                              )}
                              <div className="text-xs text-gray-500">
                                {getChordNotes(note, voicing, selectedQuality)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoicingsPage;
