/// <reference types="webmidi" />
"use client";

import { useState, useEffect, useCallback } from "react";
import { parseMIDIMessage } from "../_components/chordUtils";
import type { MIDIMessage } from "../_components/types/chord.types";

// Format timestamp to human-readable format
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
};

// Component for the debug page
const DebugPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<number>(1); // 1 means channel 1
  const [allMidiMessages, setAllMidiMessages] = useState<
    Record<number, MIDIMessage[]>
  >({}); // Store all messages per channel
  const [filteredMessages, setFilteredMessages] = useState<MIDIMessage[]>([]); // Filtered messages to display
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string>("No device");
  const [maxMessages] = useState<number>(500);
  const [filterNoteOff, setFilterNoteOff] = useState<boolean>(false);

  // Filter messages based on selected channel
  const filterMessages = useCallback(
    (messages: MIDIMessage[], channel: number) => {
      if (channel === 0) {
        return messages; // Return all messages when "All" is selected
      }
      return messages.filter((msg) => msg.channel === channel);
    },
    [],
  );

  // Update filtered messages whenever selected channel, all messages, or filterNoteOff change
  useEffect(() => {
    let filtered = filterMessages(
      allMidiMessages[selectedChannel] ?? [],
      selectedChannel,
    );
    if (filterNoteOff) {
      filtered = filtered.filter((msg) => msg.type !== "note-off");
    }
    setFilteredMessages(filtered);
  }, [selectedChannel, allMidiMessages, filterMessages, filterNoteOff]);

  // Handler for channel selection
  const handleSelectChannel = useCallback((channel: number) => {
    setSelectedChannel(channel);
  }, []);

  // Handler for incoming MIDI messages
  const handleMIDIMessage = useCallback(
    (event: WebMidi.MIDIMessageEvent) => {
      const timestamp = performance.now();
      const data = event.data;
      const parsedMessage = parseMIDIMessage(data, timestamp);

      if (parsedMessage) {
        setAllMidiMessages((prevMessages) => {
          const channelMessages = prevMessages[parsedMessage.channel] ?? [];
          const newMessages = [parsedMessage, ...channelMessages];
          if (newMessages.length > maxMessages) {
            newMessages.splice(maxMessages);
          }
          return {
            ...prevMessages,
            [parsedMessage.channel]: newMessages,
          };
        });
      }
    },
    [maxMessages],
  );

  // Effect for MIDI access initialization
  useEffect(() => {
    // Check if this is Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari || !("requestMIDIAccess" in navigator)) {
      setConnectedDevice("Browser not supported");
      return;
    }

    (
      navigator as Navigator & {
        requestMIDIAccess(): Promise<WebMidi.MIDIAccess>;
      }
    )
      .requestMIDIAccess()
      .then((access) => {
        // Get available devices
        const inputs = Array.from(access.inputs.values());
        const deviceNames = inputs
          .map((input) => input.name ?? "Unnamed device")
          .filter(Boolean);
        setMidiDevices(deviceNames);

        // Connect to devices
        if (inputs.length > 0 && inputs[0]?.name) {
          setConnectedDevice(inputs[0].name);
          inputs.forEach((input) => {
            input.onmidimessage = handleMIDIMessage;
          });
        }

        // Handle device connection/disconnection
        access.onstatechange = (event: WebMidi.MIDIConnectionEvent) => {
          if (
            event.port &&
            "type" in event.port &&
            event.port.type === "input"
          ) {
            const updatedInputs = Array.from(access.inputs.values());
            const updatedDeviceNames = updatedInputs
              .map((input) => input.name ?? "Unnamed device")
              .filter(Boolean);

            setMidiDevices(updatedDeviceNames);

            if (updatedInputs.length > 0 && updatedInputs[0]?.name) {
              setConnectedDevice(updatedInputs[0].name);
              updatedInputs.forEach((input) => {
                input.onmidimessage = handleMIDIMessage;
              });
            } else {
              setConnectedDevice("No MIDI device connected");
            }
          }
        };
      })
      .catch((err) => {
        console.error("MIDI access error:", err);
        setConnectedDevice("Failed to access MIDI devices");
      });
  }, [handleMIDIMessage]);

  // Clear messages handler
  const handleClearMessages = () => {
    setAllMidiMessages({});
    setFilteredMessages([]);
  };

  return (
    <div className="p-6">
      <h1 className="font-old-standard mb-6 text-3xl font-bold italic text-white">
        MIDI Debug Console
      </h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-52 rounded-md bg-[#1a1a1a] p-4">
          <h2 className="mb-2 text-xl text-white">Device</h2>
          <p className="text-gray-300">{connectedDevice}</p>
        </div>

        <div className="w-52 rounded-md bg-[#1a1a1a] p-4">
          <h2 className="mb-2 text-xl text-white">Channel Filter</h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((channel) => (
                <button
                  key={channel}
                  onClick={() => handleSelectChannel(channel)}
                  className={`rounded px-3 py-1 ${selectedChannel === channel ? "bg-[#8B4513] text-white" : "bg-[#333] text-gray-300 hover:bg-[#444]"}`}
                >
                  {channel}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-gray-300">Filter Note-Off:</label>
              <input
                type="checkbox"
                checked={filterNoteOff}
                onChange={(e) => setFilterNoteOff(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        <div className="w-52 rounded-md bg-[#1a1a1a] p-4">
          <h2 className="mb-2 text-xl text-white">Actions</h2>
          <button
            onClick={handleClearMessages}
            className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
          >
            Clear Messages
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[#333] bg-[#111]">
        <div className="flex items-center justify-between border-b border-[#333] bg-[#222] p-3">
          <h2 className="text-xl text-white">
            MIDI Messages{" "}
            {selectedChannel === 0
              ? "(All Channels)"
              : `(Channel ${selectedChannel})`}
          </h2>
          <span className="text-sm text-gray-400">
            {filteredMessages.length} messages
            {selectedChannel !== 0 &&
              (allMidiMessages[selectedChannel]?.length ?? 0) >
                filteredMessages.length &&
              ` (${allMidiMessages[selectedChannel]?.length ?? 0} total)`}
          </span>
        </div>

        <div id="midi-message-list" className="h-[500px] overflow-y-auto p-1">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No MIDI messages received yet
              {selectedChannel !== 0 ? ` on channel ${selectedChannel}` : ""}.
              Try playing some notes on your MIDI device.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#1a1a1a]">
                <tr className="text-left">
                  <th className="p-2 text-gray-400">Time</th>
                  <th className="p-2 text-gray-400">Ch</th>
                  <th className="p-2 text-gray-400">Type</th>
                  <th className="p-2 text-gray-400">Details</th>
                  <th className="p-2 text-gray-400">Raw</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-[#111]" : "bg-[#1a1a1a]"} hover:bg-[#222]`}
                  >
                    <td className="p-2 text-gray-300">
                      {formatTimestamp(msg.timestamp)}
                    </td>
                    <td className="p-2 text-gray-300">{msg.channel}</td>
                    <td
                      className={`p-2 ${
                        msg.type === "note-on"
                          ? "text-green-400"
                          : msg.type === "note-off"
                            ? "text-red-400"
                            : msg.type === "control-change"
                              ? "text-blue-400"
                              : msg.type === "program-change"
                                ? "text-yellow-400"
                                : "text-gray-400"
                      }`}
                    >
                      {msg.type}
                    </td>
                    <td className="p-2 text-white">
                      {msg.type === "note-on" || msg.type === "note-off" ? (
                        <span>
                          {msg.noteName} ({msg.noteNumber}){" "}
                          {msg.velocity !== undefined && `vel: ${msg.velocity}`}
                        </span>
                      ) : msg.type === "control-change" ? (
                        <span>
                          CC {msg.controlNumber}: {msg.controlValue}
                        </span>
                      ) : msg.type === "program-change" ? (
                        <span>Program {msg.programNumber}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-gray-500">
                      [
                      {msg.rawData
                        .map((b) => b.toString(16).padStart(2, "0"))
                        .join(" ")}
                      ]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>Debug information: Connected to {connectedDevice}</p>
        <p>
          Available devices:{" "}
          {midiDevices.length > 0 ? midiDevices.join(", ") : "None"}
        </p>
      </div>
    </div>
  );
};

export default DebugPage;
