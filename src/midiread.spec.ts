const readMidi = require("../dist/midiread.js").readMidi;
const r = readMidi(
  new Uint8Array(require("fs").readFileSync("./song.mid").buffer)
);
r.callback = function (cmd, obj, time) {
  console.log(cmd, obj, time);
};

r.start();
