"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduler = void 0;
const midiread_js_1 = require("./midiread.js");
async function scheduler(midi_u8, cb) {
    const { tracks, division, presets, ntracks } = (0, midiread_js_1.readMidi)(midi_u8);
    const ticksPerQuarterNote = division;
    let microsecondPerQuarterNote = 500000;
    let timeSignature = 4;
    let qn = 0;
    const totalTicks = tracks
        .map((t) => t[t.length - 1])
        .reduce((lastEvent, eventt) => Math.max(eventt.t, lastEvent), 0);
    const playedEvent = [];
    let tick = 0;
    let clockTime = 0;
    let paused = false;
    async function run() {
        while (tick < totalTicks) {
            for (let i in tracks) {
                const track = tracks[i];
                if (!track.length)
                    continue;
                while (track.length && track[0].t < tick) {
                    const newevent = track.shift();
                    cb(newevent);
                    playedEvent.push({
                        track: i,
                        clockTime,
                        ...newevent,
                    });
                    if (newevent.tempo) {
                        microsecondPerQuarterNote = newevent.tempo;
                    }
                    if (newevent.timeSignature) {
                        timeSignature =
                            (newevent.timeSignature[0] / newevent.timeSignature[1]) * 4;
                    }
                }
            }
            if (paused)
                break;
            const intervalMillisecond = microsecondPerQuarterNote / 1000 / timeSignature;
            await new Promise((resolve) => setTimeout(resolve, intervalMillisecond));
            tick += ticksPerQuarterNote / timeSignature;
            clockTime += intervalMillisecond / 1000;
            qn++;
            cb({ clockTime, qn });
        }
    }
    function rwd(amt) {
        const rwd_events = [];
        while (playedEvent.length &&
            playedEvent[playedEvent.unshift()].clockTime > clockTime - amt) {
            rwd_events.push(playedEvent.pop());
        }
        tick = rwd_events[0].tick;
        clockTime -= amt;
        while (rwd_events.length) {
            tracks[rwd_events[0].track].push(rwd_events.shift());
        }
    }
    function pause() {
        paused = true;
    }
    function resume() {
        paused = false;
        run();
    }
    return {
        ctrls: { pause, rwd, run, resume },
        tracks,
        ntracks,
        presets,
        totalTicks,
    };
}
exports.scheduler = scheduler;
