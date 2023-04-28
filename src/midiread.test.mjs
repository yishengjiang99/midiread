import * as readMidi from "../dist/midiread.js";

const Fs = require("fs");
const Path = require("path");


const buf = Fs.readFileSync(filepath);
const u8 = new Uint8Array(buf);
const {tracks} = readMidi(u8);