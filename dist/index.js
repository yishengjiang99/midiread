"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timer_js_1 = require("./timer.js");
const midilist_js_1 = require("./midilist.js");
const midi_connect_js_1 = require("./midi-connect.js");
const midiread_js_1 = require("./midiread.js");
const ctx_js_1 = require("./ctx.js");
let inputs, outputs, outputsend;
let ctx;
let proc;
function initMidiAccessForAudioCtx(ctx, port) {
    midi_connect_js_1.midiSelectBtn({
        parentElement: document.body,
        msgport: port,
        onMidiMessage: (m) => (document.body.innerHTML += m.join(",")),
        onPortsGot: ([inputs, outputs]) => midi_connect_js_1.midiWriteSelect({ outputs, onselect: (o) => (outputsend = o) }),
    });
}
const playlist = midilist_js_1.midipanel(document.querySelector("aside"), playMidi);
// let playlist=['song.mid','song.mid','song.mid']
let nowPlaying = null;
window.onhashchange = () => {
    playlist[0] = midilist_js_1.cdnhost + location.hash.substr(1);
    playMidi(playlist[0]);
};
function playMidi(url) {
    nowPlaying = url;
    const ut = outputsend;
    const sorted = [];
    const tty = document.querySelector("pre");
    midiread_js_1.fetchAwaitBuffer(nowPlaying).then((ab) => {
        const { tracks, start, tick, readAt } = midiread_js_1.readMidi(ab, (cmd, obj, time) => {
            if (cmd == "channel")
                ut.send(obj.data);
            sorted.push([time, cmd, obj]);
            tty.innerHTML = sorted.map((s) => JSON.stringify(s)).join("\n");
            if (sorted.length > 50)
                sorted.shift();
        });
        start();
        console.log(sorted.length);
    });
}
timer_js_1.playPauseTimer();
ctx_js_1.initAudioCtx().then((res) => {
    ctx = res.ctx;
    proc = res.proc;
    initMidiAccessForAudioCtx(ctx, proc.port);
});
