"use client";

import { useState, useEffect, useCallback } from "react";
import { getMIDINoteName } from "../_components/chordUtils";

// Define MIDI message type for better organization
type MIDIMessageType =
  | "note-on"
  | "note-off"
  | "control-change"
  | "program-change"
  | "unknown";

interface MIDIMessage {
  timestamp: number;
  channel: number;
  type: MIDIMessageType;
  noteNumber?: number;
  noteName?: string;
  velocity?: number;
  controlNumber?: number;
  controlValue?: number;
  programNumber?: number;
  rawData: number[];
}

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
  const [selectedChannel, setSelectedChannel] = useState<number>(0); // 0 means all channels
  const [allMidiMessages, setAllMidiMessages] = useState<MIDIMessage[]>([]); // Store all messages
  const [filteredMessages, setFilteredMessages] = useState<MIDIMessage[]>([]); // Filtered messages to display
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string>(
    "No MIDI device connected",
  );
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [maxMessages, setMaxMessages] = useState<number>(100);

  // Parse MIDI data to structured format
  const parseMIDIMessage = useCallback(
    (data: Uint8Array, timestamp: number): MIDIMessage | null => {
      if (data.length < 1) return null;

      const statusByte = data?.[0];
      const messageType = statusByte ? statusByte >> 4 : 0;
      const channel = statusByte ? (statusByte & 0x0f) + 1 : 0;

      let type: MIDIMessageType = "unknown";
      let noteNumber: number | undefined;
      let noteName: string | undefined;
      let velocity: number | undefined;
      let controlNumber: number | undefined;
      let controlValue: number | undefined;
      let programNumber: number | undefined;

      // Note-on message
      if (messageType === 9) {
        type = data?.[2] !== undefined && data[2] > 0 ? "note-on" : "note-off"; // Note-on with velocity 0 is treated as note-off
        noteNumber = data[1];
        noteName =
          noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
        velocity = data[2];
      }
      // Note-off message
      else if (messageType === 8) {
        type = "note-off";
        noteNumber = data[1];
        noteName =
          noteNumber !== undefined ? getMIDINoteName(noteNumber) : undefined;
        velocity = data[2];
      }
      // Control change
      else if (messageType === 11) {
        type = "control-change";
        controlNumber = data[1];
        controlValue = data[2];
      }
      // Program change
      else if (messageType === 12) {
        type = "program-change";
        programNumber = data[1];
      }

      return {
        timestamp,
        channel,
        type,
        noteNumber,
        noteName,
        velocity,
        controlNumber,
        controlValue,
        programNumber,
        rawData: Array.from(data),
      };
    },
    [],
  );

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

  // Update filtered messages whenever selected channel or all messages change
  useEffect(() => {
    const filtered = filterMessages(allMidiMessages, selectedChannel);
    setFilteredMessages(filtered);
  }, [selectedChannel, allMidiMessages, filterMessages]);

  // Handler for channel selection
  const handleSelectChannel = useCallback((channel: number) => {
    setSelectedChannel(channel);
  }, []);

  // Handler for incoming MIDI messages
  const handleMIDIMessage = useCallback(
    (event: MIDIMessageEvent) => {
      const timestamp = performance.now();
      const data = event.data;
      const parsedMessage = parseMIDIMessage(data, timestamp);

      if (parsedMessage) {
        setAllMidiMessages((prevMessages) => {
          // Keep the list at max length
          const newMessages = [...prevMessages, parsedMessage];
          if (newMessages.length > maxMessages) {
            return newMessages.slice(-maxMessages);
          }
          return newMessages;
        });
      }
    },
    [parseMIDIMessage, maxMessages],
  );

  // Effect for MIDI access initialization
  useEffect(() => {
    if (!("requestMIDIAccess" in navigator)) {
      setConnectedDevice("MIDI not supported in this browser");
      return;
    }

    (navigator as Navigator & { requestMIDIAccess(): Promise<MIDIAccess> })
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
        access.onstatechange = (event) => {
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && filteredMessages.length > 0) {
      const messageList = document.getElementById("midi-message-list");
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }
  }, [filteredMessages, autoScroll]);

  // Clear messages handler
  const handleClearMessages = () => {
    setAllMidiMessages([]);
    setFilteredMessages([]);
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 font-old-standard text-3xl font-bold italic text-white">
        MIDI Debug Console
      </h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="rounded-md bg-[#1a1a1a] p-4">
          <h2 className="mb-2 text-xl text-white">Device</h2>
          <p className="text-gray-300">{connectedDevice}</p>
        </div>

        <div className="rounded-md bg-[#1a1a1a] p-4">
          <h2 className="mb-2 text-xl text-white">Channel Filter</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectChannel(0)}
              className={`rounded px-3 py-1 ${selectedChannel === 0 ? "bg-[#8B4513] text-white" : "bg-[#333] text-gray-300 hover:bg-[#444]"}`}
            >
              All
            </button>
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
        </div>

        <div className="rounded-md bg-[#1a1a1a] p-4">
          <h2 className="mb-2 text-xl text-white">Options</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Max messages:</label>
              <select
                value={maxMessages}
                onChange={(e) => setMaxMessages(Number(e.target.value))}
                className="rounded bg-[#333] px-2 py-1 text-white"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-[#1a1a1a] p-4">
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
              allMidiMessages.length > filteredMessages.length &&
              ` (${allMidiMessages.length} total)`}
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
