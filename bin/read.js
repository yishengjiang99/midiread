#!/usr/bin/env node
const readMidi = require("../lib/midiread").readMidi;
const scheduler = require("../lib/scheduler").scheduler;
const Fs = require("fs");
const Path = require("path");

const filepath =
  Path.basename(process.argv[process.argv.length - 1]) == "read.js" ||
  process.argv[process.argv.length - 1] == "midiread"
    ? Path.join(__dirname, "../song.mid")
    : Path.resolve(process.cwd(), process.argv[process.argv.length - 1]);

const buf = Fs.readFileSync(filepath);
const u8 = new Uint8Array(buf);

(async () => {
  const { run, rwd, pause } = await scheduler(u8, (x) => console.log(x));
  run();
})();
// import { readFileSync } from "fs";

// import { readMidi } from "midiread";
