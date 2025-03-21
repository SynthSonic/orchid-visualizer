import { PianoKeyboard } from "./_components/PianoKeyboard";
import { TroubleshootingTip } from "./_components/TroubleshootingTip";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center justify-center ">
        <div className="container flex flex-col items-center justify-center px-4 py-8">
          <div className="rounded-xl bg-zinc-800/40 p-4 shadow-lg backdrop-blur-sm">
            <PianoKeyboard />
          </div>
        </div>
        <TroubleshootingTip />
      </main>
    </HydrateClient>
  );
}
