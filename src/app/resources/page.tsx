import React from "react";

const ResourcesPage = () => {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-old-standard text-3xl font-bold italic">
          Resources
        </h1>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-semibold">Official</h2>
          <ul className="list-inside list-disc">
            <li>
              <a
                href="https://manual.telepathicinstruments.com/"
                className="text-[#8B4513] hover:underline"
              >
                Orchid User Manual
              </a>
            </li>
            <li>
              <a
                href="https://telepathicinstruments.com/pages/support"
                className="text-[#8B4513] hover:underline"
              >
                Orchid Support
              </a>
            </li>
            <li>
              <a
                href="https://orchid.nolt.io/"
                className="text-[#8B4513] hover:underline"
              >
                Feature Requests
              </a>
            </li>
            <li>
              <a
                href="https://firmware.telepathicinstruments.com/"
                className="text-[#8B4513] hover:underline"
              >
                Firmware Updates
              </a>
            </li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-semibold">Community</h2>
          <ul className="list-inside list-disc">
            <li>
              <a
                href="https://discord.gg/m23GeqeS8D"
                className="text-[#8B4513] hover:underline"
              >
                Community Discord
              </a>
            </li>
            <li>
              <a
                href="https://github.com/SynthSonic/orchid-visualizer"
                className="text-[#8B4513] hover:underline"
              >
                Orchid Visualizer GitHub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/SynthSonic/orchid-visualizer/issues"
                className="text-[#8B4513] hover:underline"
              >
                Orchid Visualizer Feature Requests
              </a>
            </li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-semibold">Learning</h2>

          <div className="mt-4">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/GKf50ib0tho"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
