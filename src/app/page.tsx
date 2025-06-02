import { PianoKeyboard } from "./_components/PianoKeyboard";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="relative flex flex-col items-center">
        <div className="container flex flex-col items-center mt-17 px-4" style={{ marginTop: '68px' }}>
          <PianoKeyboard />
        </div>
      </main>
    </HydrateClient>
  );
}
