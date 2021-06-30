import { playPauseTimer } from "./timer.js";
import { cdnhost, midipanel } from "./midilist.js";
import { midiSelectBtn, midiWriteSelect, } from "./midi-connect.js";
import { fetchAwaitBuffer, readMidi } from "./midiread.js";
import { initAudioCtx } from "./ctx.js";
let inputs, outputs, outputsend;
let ctx;
let proc;
function initMidiAccessForAudioCtx(ctx, port) {
    midiSelectBtn({
        parentElement: document.body,
        msgport: port,
        onMidiMessage: (m) => (document.body.innerHTML += m.join(",")),
        onPortsGot: ([inputs, outputs]) => midiWriteSelect({ outputs, onselect: (o) => (outputsend = o) }),
    });
}
const playlist = midipanel(document.querySelector("aside"), playMidi);
// let playlist=['song.mid','song.mid','song.mid']
let nowPlaying = null;
window.onhashchange = () => {
    playlist[0] = cdnhost + location.hash.substr(1);
    playMidi(playlist[0]);
};
function playMidi(url) {
    nowPlaying = url;
    const ut = outputsend;
    const sorted = [];
    const tty = document.querySelector("pre");
    fetchAwaitBuffer(nowPlaying).then((ab) => {
        const { tracks, start, tick, readAt } = readMidi(ab, (cmd, obj, time) => {
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
playPauseTimer();
initAudioCtx().then((res) => {
    ctx = res.ctx;
    proc = res.proc;
    initMidiAccessForAudioCtx(ctx, proc.port);
});
