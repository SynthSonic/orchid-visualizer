import React from "react";

const ResourcesPage = () => {
  return (
    <div className="p-8" style={{ paddingTop: "53px", paddingLeft: "40px" }}>
      <div className="mx-auto flex max-w-7xl justify-center">
        <div
          className="flex flex-col justify-center gap-20 md:flex-row"
          style={{ marginLeft: "32px" }}
        >
          {/* Left Column */}
          <div className="w-[300px]">
            <h2 className="mb-8 text-heading-1">Community</h2>

            <div className="space-y-6">
              {/* Link 1 */}
              <div className="block">
                <a
                  href="https://discord.gg/m23GeqeS8D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#AD792A] no-underline text-title-1"
                >
                  Official Community Discord
                </a>
                <div className="text-[#888888] text-body-1">
                  Connect with fellow Orchid owners and the Telepathic team.
                </div>
              </div>

              {/* Link 2 */}
              <div className="block">
                <a
                  href="https://github.com/SynthSonic/orchid-visualizer/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#AD792A] no-underline text-title-1"
                >
                  Visualizer Feature Requests
                </a>
                <div className="text-[#888888] text-body-1">
                  Feedback welcomed. There is also a Discord channel for
                  #orchid-labs
                </div>
              </div>

              {/* Link 3 */}
              <div className="block">
                <a
                  href="https://github.com/SynthSonic/orchid-visualizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#AD792A] no-underline text-title-1"
                >
                  Visualizer GitHub
                </a>
                <div className="text-[#888888] text-body-1">
                  Open-source community project
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[300px]">
            <h2 className="mb-8 text-heading-1">Telepathic Instruments</h2>

            <div className="space-y-6">
              {/* Link 1 */}
              <div className="block">
                <a
                  href="https://help.telepathicinstruments.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#AD792A] no-underline text-title-1"
                >
                  Telepathic Support
                </a>
                <div className="text-[#888888] text-body-1">
                  Product manuals, feature requests, contact info, etc.
                </div>
              </div>

              {/* Link 2 */}
              <div className="block">
                <a
                  href="https://www.youtube.com/@telepathic.instruments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#AD792A] no-underline text-title-1"
                >
                  Telepathic YouTube
                </a>
                <div className="text-[#888888] text-body-1">
                  Product manuals, feature requests, contact info, etc.
                </div>
              </div>

              {/* Link 3 */}
              <div className="block">
                <a
                  href="https://firmware.telepathicinstruments.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#AD792A] no-underline text-title-1"
                >
                  Orchid Firmware Updates
                </a>
                <div className="text-[#888888] text-body-1">
                  Requires Chrome or Opera based browser
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
