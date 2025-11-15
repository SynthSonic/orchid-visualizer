"use client";

import React, { useState } from "react";
import type {
  OrchidSettings,
  PerformanceMode,
  FXType,
  DrumLoop,
  ReverbType,
  SaturatorType,
  FXSetting,
} from "./types/chord.types";
import {
  PERFORMANCE_MODES,
  FX_TYPES,
  DRUM_LOOPS,
} from "./types/chord.types";

interface AdditionalOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: OrchidSettings) => void;
  initialSettings?: OrchidSettings;
}

export const AdditionalOptionsDialog: React.FC<
  AdditionalOptionsDialogProps
> = ({ isOpen, onClose, onSave, initialSettings }) => {
  const [title, setTitle] = useState<string>(initialSettings?.title ?? "");
  const [sound, setSound] = useState<number | "">(
    initialSettings?.sound ?? "",
  );
  const [voicing, setVoicing] = useState<number | "">(
    initialSettings?.voicing ?? "",
  );
  const [performance, setPerformance] = useState<PerformanceMode | "">(
    initialSettings?.performance ?? "",
  );
  const [performanceValue, setPerformanceValue] = useState<
    number | ""
  >(initialSettings?.performanceValue ?? "");
  const [selectedFX, setSelectedFX] = useState<FXSetting[]>(
    initialSettings?.fx ?? [],
  );
  const [filter, setFilter] = useState<number | "">(
    initialSettings?.filter ?? "",
  );
  const [bpm, setBpm] = useState<number | "">(initialSettings?.bpm ?? "");
  const [drumLoop, setDrumLoop] = useState<DrumLoop | "">(
    initialSettings?.drumLoop ?? "",
  );

  // Drum FX state
  const [reverbType, setReverbType] = useState<ReverbType | "">(
    initialSettings?.drumFX?.reverbType ?? "",
  );
  const [reverbMix, setReverbMix] = useState<number | "">(
    initialSettings?.drumFX?.reverbMix ?? "",
  );
  const [saturatorType, setSaturatorType] = useState<SaturatorType | "">(
    initialSettings?.drumFX?.saturatorType ?? "",
  );
  const [saturatorMix, setSaturatorMix] = useState<number | "">(
    initialSettings?.drumFX?.saturatorMix ?? "",
  );

  const handleFXToggle = (fxType: FXType) => {
    const existingIndex = selectedFX.findIndex((fx) => fx.type === fxType);

    if (existingIndex >= 0) {
      // Remove if already selected
      setSelectedFX(selectedFX.filter((_, i) => i !== existingIndex));
    } else if (selectedFX.length < 3) {
      // Add if less than 3 selected
      setSelectedFX([...selectedFX, { type: fxType, value: 5 }]);
    }
  };

  const handleFXValueChange = (fxType: FXType, value: number) => {
    setSelectedFX(
      selectedFX.map((fx) => (fx.type === fxType ? { ...fx, value } : fx)),
    );
  };

  const handleSave = () => {
    const settings: OrchidSettings = {};

    if (title !== "") settings.title = title;
    if (sound !== "") settings.sound = sound;
    if (voicing !== "") settings.voicing = voicing;
    if (performance !== "") settings.performance = performance;
    if (performanceValue !== "")
      settings.performanceValue = performanceValue;
    if (selectedFX.length > 0) settings.fx = selectedFX;
    if (filter !== "") settings.filter = filter;
    if (bpm !== "") settings.bpm = bpm;
    if (drumLoop !== "") settings.drumLoop = drumLoop;

    // Only include drumFX if at least one field is set
    if (
      reverbType !== "" ||
      reverbMix !== "" ||
      saturatorType !== "" ||
      saturatorMix !== ""
    ) {
      settings.drumFX = {};
      if (reverbType !== "") settings.drumFX.reverbType = reverbType;
      if (reverbMix !== "") settings.drumFX.reverbMix = reverbMix;
      if (saturatorType !== "") settings.drumFX.saturatorType = saturatorType;
      if (saturatorMix !== "") settings.drumFX.saturatorMix = saturatorMix;
    }

    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-[#1a1a1a] p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-2xl font-bold">Additional Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              PDF Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title for the chord sheet"
              className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
            />
          </div>

          {/* Sound */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              Sound (1-60)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={sound}
              onChange={(e) =>
                setSound(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Optional"
              className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
            />
          </div>

          {/* Voicing */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              Voicing (1-60)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={voicing}
              onChange={(e) =>
                setVoicing(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Optional"
              className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
            />
          </div>

          {/* Performance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-mono text-sm text-gray-400">
                Performance
              </label>
              <select
                value={performance}
                onChange={(e) =>
                  setPerformance(e.target.value as PerformanceMode | "")
                }
                className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
              >
                <option value="">None</option>
                {PERFORMANCE_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-sm text-gray-400">
                Value
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={performanceValue}
                onChange={(e) =>
                  setPerformanceValue(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="Optional"
                className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
              />
            </div>
          </div>

          {/* FX (up to 3) */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              FX (Select up to 3)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FX_TYPES.map((fxType) => {
                const isSelected = selectedFX.some((fx) => fx.type === fxType);
                const fxSetting = selectedFX.find((fx) => fx.type === fxType);

                return (
                  <div key={fxType} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFXToggle(fxType)}
                      disabled={!isSelected && selectedFX.length >= 3}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <span className="flex-1 font-mono text-sm">{fxType}</span>
                    {isSelected && (
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={fxSetting?.value ?? 0}
                        onChange={(e) =>
                          handleFXValueChange(fxType, Number(e.target.value))
                        }
                        className="w-16 rounded-md border border-gray-600 bg-[#2a2a2a] px-2 py-1 font-mono text-sm text-white focus:border-[#8B5522] focus:outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              Filter (0-127)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Off"
              className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
            />
          </div>

          {/* Drum FX */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              Drum FX
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Reverb Type (1-3)
                </label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={reverbType}
                  onChange={(e) =>
                    setReverbType(
                      e.target.value === ""
                        ? ""
                        : (Number(e.target.value) as ReverbType),
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Reverb Mix (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={reverbMix}
                  onChange={(e) =>
                    setReverbMix(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Off"
                  className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Saturator Type (1-3)
                </label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={saturatorType}
                  onChange={(e) =>
                    setSaturatorType(
                      e.target.value === ""
                        ? ""
                        : (Number(e.target.value) as SaturatorType),
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Saturator Mix (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={saturatorMix}
                  onChange={(e) =>
                    setSaturatorMix(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Off"
                  className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BPM */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              BPM (up to 200)
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={bpm}
              onChange={(e) =>
                setBpm(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Optional"
              className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
            />
          </div>

          {/* Drum Loop */}
          <div>
            <label className="mb-2 block font-mono text-sm text-gray-400">
              Drum Loop
            </label>
            <select
              value={drumLoop}
              onChange={(e) => setDrumLoop(e.target.value as DrumLoop | "")}
              className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-3 py-2 font-mono text-white focus:border-[#8B5522] focus:outline-none"
            >
              <option value="">None</option>
              {DRUM_LOOPS.map((loop) => (
                <option key={loop} value={loop}>
                  {loop}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-700 px-6 py-2 font-mono text-white transition-colors hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-[#8B5522] px-6 py-2 font-mono text-white transition-colors hover:bg-[#A66A2D]"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

