"use client";

import React, { useState } from "react";
import type { NoteName } from "../_components/types/chord.types";
import {
  getFirstVoicing,
  getChordNotes,
  getVoicingsForQuality,
} from "../_components/voicingUtils";

type ChordQuality = "Dim" | "Min" | "Maj" | "Sus";

const WHOLE_NOTES: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

const VoicingsPage: React.FC = () => {
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>("Maj");
  const voicings = getVoicingsForQuality(selectedQuality);

  // Find the maximum number of voicings across all notes
  const maxVoicings = Math.max(
    ...WHOLE_NOTES.map((note) => Object.keys(voicings[note] ?? {}).length),
  );

  return (
    <div className="p-8 pt-[60px]">
      <div className="mx-auto flex max-w-7xl flex-col items-center">
        <div className="flex w-full justify-center">
          <div className="inline-block overflow-x-auto">
            {/* Chord quality buttons row */}
            <div
              className="flex"
              style={{
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
              }}
            >
              {(["Dim", "Min", "Maj", "Sus"] as ChordQuality[]).map(
                (quality, index) => (
                  <button
                    key={quality}
                    onClick={() => setSelectedQuality(quality)}
                    className="relative"
                    style={{ marginRight: index === 3 ? "0" : "8px" }}
                  >
                    <div
                      className={`relative h-[75px] w-[75px] ${selectedQuality === quality ? "bg-[#AD792A]" : "bg-black"}`}
                      style={{
                        border: "1px solid #FFFFFF",
                        borderRadius: "6px",
                        margin: "8px 0 8px 0",
                      }}
                    >
                      <span
                        className="absolute"
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontWeight: 500,
                          fontSize: "16px",
                          letterSpacing: "-0.03em",
                          color:
                            selectedQuality === quality ? "#FFFFFF" : "#888888",
                          left: "12px",
                          top: "12px",
                        }}
                      >
                        {quality}
                      </span>
                    </div>
                  </button>
                ),
              )}
            </div>

            <div
              style={{
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid #FFFFFF",
              }}
              className="--font-geist-sans"
            >
              <table
                className="w-full table-fixed"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr className="bg-[#A88B5E]">
                    <th className="w-36 px-4 py-4 text-left text-base font-bold text-black">
                      Inversion
                    </th>
                    {WHOLE_NOTES.map((note) => (
                      <th
                        key={note}
                        className="w-36 px-4 py-4 text-left text-base font-bold text-black"
                      >
                        {note}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxVoicings }, (_, i) => {
                    const firstVoicings = WHOLE_NOTES.map((note) =>
                      getFirstVoicing(voicings[note] ?? {}),
                    );
                    const inversion =
                      i % 3 === 0 ? "1st" : i % 3 === 1 ? "2nd" : "Root";

                    return (
                      <tr
                        key={i}
                        className="border-t border-white transition-colors hover:bg-[#222]"
                      >
                        <td className="w-36 px-4 py-4 text-base font-medium text-white">
                          {inversion}
                        </td>
                        {WHOLE_NOTES.map((note, noteIndex) => {
                          const voicingObj = voicings[note]?.[i];
                          const firstVoicing = firstVoicings[noteIndex] ?? null;
                          const isFirstVoicing =
                            voicingObj?.voicing === firstVoicing;
                          const shouldShowDash =
                            voicingObj !== undefined &&
                            firstVoicing !== null &&
                            voicingObj.voicing < firstVoicing;

                          return (
                            <td
                              key={note}
                              className={`w-36 px-4 py-4 ${
                                isFirstVoicing
                                  ? "font-medium text-[#AD792A]"
                                  : "text-white"
                              }`}
                            >
                              {shouldShowDash ? (
                                "-"
                              ) : (
                                <div>
                                  {isFirstVoicing ? (
                                    <strong>1</strong>
                                  ) : (
                                    (voicingObj?.voicing ?? "-")
                                  )}
                                  <div className="text-sm text-[#888888]">
                                    {getChordNotes(
                                      note,
                                      voicingObj,
                                      selectedQuality,
                                    )}
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
      </div>
    </div>
  );
};

export default VoicingsPage;
