"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferReader = exports.readAllEvents = exports.readMidi = exports.fetchAwaitBuffer = exports.ccs = void 0;
exports.ccs = {
    1: "Modulation wheel",
    2: "Breath Control",
    7: "Volume",
    8: "balance",
    10: "Pan",
    11: "Expression",
    64: "Sustain Pedal (on/off)",
    65: " Portamento (on/off)",
    71: " Resonance (filter)",
    74: "Frequency Cutoff (filter)",
    92: "reverb",
    93: "chrous level",
    94: "detune",
    95: "phaser",
};
async function fetchAwaitBuffer(url) {
    return new Uint8Array(await (await fetch(url)).arrayBuffer());
}
exports.fetchAwaitBuffer = fetchAwaitBuffer;
function readMidi(buffer, cb = function (cmd, obj, time) {
    console.log(cmd, obj, time);
}) {
    const reader = bufferReader(buffer);
    const { fgetc, offset, btoa, read32, read16, fgetnc, read24, readVarLength, fgets } = reader;
    const chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
    const headerLength = read32();
    const format = read16();
    const ntracks = read16();
    const division = read16();
    let g_time = 0;
    const tracks = [];
    let microsecPerBeat = 500000;
    function readMessage(track, trackId, onMsgoverride = null) {
        async function onMsg(cmd, obj) {
            obj = { ...obj, trackId }; // trackId;
            if (onMsgoverride)
                onMsgoverride(cmd, obj, track.time);
            await cb(cmd, obj, track.time);
        }
        const timedelta = readVarLength();
        const event = fgetc();
        if (!event)
            return false;
        let meta;
        let info = [];
        switch (event) {
            case 0xff:
                meta = fgetc();
                var len = readVarLength();
                onMsg("meta", { data: fgetnc(len) });
                break;
            case 0xf7:
                onMsg("sysEx", { length: readVarLength(), data: fgets(len) });
                break;
            case 0xf0:
                onMsg("end sysex", { length: readVarLength(), data: fgets(len) });
                break;
            default: break;
        }
        if (event & 0x80) {
            track.time += timedelta;
            switch (event >> 4) {
                case 0x08:
                case 0x09:
                case 0x0a:
                case 0x0b:
                case 0x0d:
                case 0x0e:
                    onMsg("channel", { data: [event, fgetc(), fgetc()] });
                    break;
                case 0x0c:
                    onMsg("channel", { data: [event, fgetc()] });
                    break;
            }
        }
    }
    for (let i = 0; i < ntracks; i++) {
        console.assert([btoa(), btoa(), btoa(), btoa()].join("") == "MTrk");
        let mtrkLength = read32();
        const endofTrack = reader.offset + mtrkLength;
        tracks.push({ endofTrack, offset: reader.offset, time: 0, program: 0, events: [] });
        // while(reader.offset<endofTrack){
        //  readMessage(tracks[i],1,(cmd,obj,time)=>{
        //    tracks[i].events.push([time,cmd, obj]);
        //  })
        // }
        reader.offset = endofTrack;
    }
    function readAt(g_time) {
        let activeTracks = 0;
        tracks.forEach((track, trackId) => {
            reader.offset = track.offset;
            while (track.time <= g_time) {
                activeTracks++;
                readMessage(track, trackId);
            }
            track.offset = reader.offset;
        });
    }
    function tick() {
        g_time = g_time + division / 2;
        readAt(g_time);
    }
    let stopped = false;
    return {
        format,
        ntracks,
        division,
        tracks,
        readAt,
        set callback(fn) {
            cb = fn;
        },
        get callback() {
            return this.cb;
        },
        get time() {
            return (g_time / (division / microsecPerBeat)) * 1e6;
        },
        get ticksPer4n() {
            return this.division;
        },
        get tempo() {
            return (60 * 1e6) / microsecPerBeat;
        },
        get milisecondPerEigthNote() {
            return microsecPerBeat / 1000 / 2; /* qn per minute */
        },
        get ticksPerSecond() {
            return (division / microsecPerBeat) * 1e6;
        },
        readAll: () => readAt(Infinity),
        tick,
        start: () => {
            stopped = false;
            function loop() {
                if (stopped)
                    return;
                tick();
                setTimeout(loop, microsecPerBeat / 1e3 / 2);
            }
            loop();
        },
        stop: () => (stopped = true),
        meta: { chunkType, headerLength, format, ntracks, division },
        addListener: (handler) => (cb = handler),
        pump: (u8a) => reader.pump(u8a),
    };
}
exports.readMidi = readMidi;
async function readAllEvents(ab) {
    const r = readMidi(ab);
    r.readAt(0);
    let i = 0;
    var pending = {};
    const events = [];
    const programs = [];
    const notes = new Array(16).fill([]);
    r.callback = (cmd, obj, time) => {
        events.push({ cmd, obj, time, beat: time / r.ticksPer4n });
        console.log(cmd, time / r.ticksPer4n, Object.values(obj).join(","));
        switch (cmd) {
            case "Program":
                programs[obj.channel] = obj.program;
                break;
            case "noteOn":
                pending[(obj.channel << 8) + obj.note] = { cmd, ...obj, time };
                if (obj.vel == 0) {
                    cmd = "noteOff";
                }
                else {
                    break;
                }
            case "noteOff":
                if (pending[(obj.channel << 8) + obj.note]) {
                    const onevent = pending[(obj.channel << 8) + obj.note];
                    const dur = time - onevent.time;
                    delete pending[(obj.channel << 8) + obj.note];
                    notes[obj.channel].push(dur, onevent.time, obj.note, obj.channel, obj.velocity);
                }
                break;
        }
    };
    while (i < 100000) {
        r.readAt((i += r.ticksPer4n / 2));
    }
    return { events, programs, notes };
}
exports.readAllEvents = readAllEvents;
function bufferReader(buffer) {
    let _offset = 0, eos = false;
    const EOS = "OES";
    let _buf = [buffer];
    let bl = buffer.byteLength;
    const fgetc = () => {
        if (eos)
            return 0x00;
        const ret = _buf[0][_offset];
        _offset++;
        ({ bl, eos } = checkeos(_offset, bl, _buf, eos));
        return ret;
    };
    const btoa = () => String.fromCharCode(fgetc());
    const read32 = () => (fgetc() << 24) | (fgetc() << 16) | (fgetc() << 8) | fgetc();
    const read16 = () => (fgetc() << 8) | fgetc();
    const read24 = () => (fgetc() << 16) | (fgetc() << 8) | fgetc();
    const fgets = (n) => {
        let s = "";
        while (n-- > 0)
            s += btoa();
        return s;
    };
    const fgetnc = (n) => n > 1 ? [fgetc(), ...fgetnc(n - 1)] : [fgetc()];
    const readVarLength = () => {
        let v = 0;
        let n = fgetc();
        v = n & 0x7f;
        while (n & 0x80) {
            n = fgetc();
            v = (v << 7) | (n & 0x7f);
        }
        return v;
    };
    return {
        pump: (ab) => {
            _buf.push(ab);
        },
        get offset() {
            return _offset;
        },
        set offset(offset) {
            _offset = offset;
        },
        fgetc,
        btoa,
        read32,
        read16,
        read24,
        fgetnc,
        readVarLength,
        fgets,
    };
}
exports.bufferReader = bufferReader;
function checkeos(_offset, bl, _buf, eos) {
    if (_offset > bl) {
        _buf.shift();
        if (_buf[0]) {
            bl = _buf[0].length;
        }
        else {
            eos = true;
        }
    }
    return { bl, eos };
}
