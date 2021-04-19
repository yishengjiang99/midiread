import { expect } from "chai";
import { readAllEvents } from ".";

describe("index.ts", () => {
  it("opens and reads midifile", async () => {
    async function writef(name) {
      const { events, programs, notes } = await readAllEvents(name);
      expect(notes).to.exist;
      require("fs").writeFileSync(
        name + ".json",
        JSON.stringify({ events, programs, notes })
      );
    }
    await writef("./midi/furelise.mid");
  });
});
