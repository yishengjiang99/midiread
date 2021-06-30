const readMidi = require("./midiread").readMidi;
const r = readMidi(new Uint8Array(require("fs").readFileSync("./song.mid").buffer), function (cmd, obj, time) {
    console.log(cmd, obj, time);
});
r.start();
