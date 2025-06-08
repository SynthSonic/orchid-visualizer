import { PianoKeyboard } from "./_components/PianoKeyboard";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="relative flex flex-col items-center">
        <div
          className="mt-17 container flex flex-col items-center px-4"
          style={{ marginTop: "68px" }}
        >
          <PianoKeyboard />
        </div>
      </main>
    </HydrateClient>
  );
}
