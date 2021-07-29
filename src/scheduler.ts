import { readMidi } from "./midiread.js";
async function scheduler(url) {
  const res = await fetch(url);
  const ab = await res.arrayBuffer();

  const { tracks, division } = readMidi(new Uint8Array(ab));
  let time = 0;
  setInterval(() => {
    tracks.forEach((t) => {
      if (t && t[0] && t[0][0] < time) {
        const eventt = t.shift();
        const delay = eventt.shift();
        //@ts-ignore
        postMessage({ eventt });
      }
    }); //@ts-ignore

    postMessage({ t: time });

    time++;
  }, division / 255);
}
scheduler(self.location.hash.split("#")[1]);
