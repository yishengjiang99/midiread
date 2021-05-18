const readMidi = require("../lib/midiread.js").readMidi;
const r = readMidi(new Uint8Array(require("fs").readFileSync("./song.mid").buffer));
r.callback = function (cmd, obj, time) {
    console.log(cmd, obj, time);
};
r.readAt(1);
r.readAt(2);
r.readAt(3);
r.readAt(55);
