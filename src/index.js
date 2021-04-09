"use strict";
exports.__esModule = true;
exports.readMidi = void 0;
var bufread_js_1 = require("./bufread.js");
function readMidi(buffer, callback) {
    var reader = bufread_js_1.bufferReader(buffer);
    var fgetc = reader.fgetc, offset = reader.offset, btoa = reader.btoa, read32 = reader.read32, read16 = reader.read16, read24 = reader.read24, readVarLength = reader.readVarLength, fgets = reader.fgets;
    var chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
    var headerLength = read32();
    var format = read16();
    var ntracks = read16();
    var division = read16();
    console.log(division);
    var cb = callback || console.log;
    cb("header", { chunkType: chunkType, headerLength: headerLength, format: format, ntracks: ntracks, division: division }, 0);
    var g_time = 0;
    var tracks = [];
    var limit = buffer.byteLength;
    var tempo;
    var microsecPerBeat = 50000;
    var bpm;
    var metainfo = [];
    var timesigs = [];
    while (reader.offset < limit) {
        var mhrk = [btoa(), btoa(), btoa(), btoa()].join("");
        var mhrkLength = read32();
        var endofTrack = reader.offset + mhrkLength;
        tracks.push({ endofTrack: endofTrack, offset: reader.offset, time: 0, program: 0 });
        reader.offset = endofTrack;
    }
    function readAt(g_time) {
        for (var _i = 0, tracks_1 = tracks; _i < tracks_1.length; _i++) {
            var track = tracks_1[_i];
            reader.offset = track.offset;
            while (track.time <= g_time && reader.offset < track.endofTrack) {
                track.time += readVarLength();
                readMessage(track);
            }
            track.offset = reader.offset;
        }
        function readMessage(track) {
            function onMsg(cmd, obj) {
                if (obj === void 0) { obj = ""; }
                cb(cmd, obj !== null && obj !== void 0 ? obj : {}, track.time);
            }
            var msg = fgetc();
            if (!msg)
                return false;
            var meta;
            var info = [];
            if (msg >= 0xf0) {
                switch (msg) {
                    case 0xff:
                        meta = fgetc();
                        var len = readVarLength();
                        var cmd = "";
                        switch (meta) {
                            case 0x01:
                                cmd = "Text Event";
                            case 0x02:
                                cmd = cmd || "Copyright Notice";
                            case 0x03:
                                cmd = cmd || "Sequence/Track Name";
                            case 0x04:
                                cmd = cmd || "Instrument Name";
                            case 0x05:
                                cmd = cmd || "Lyric";
                            case 0x06:
                                cmd = cmd || "Marker";
                            case 0x07:
                                cmd = cmd || "queue ptr";
                                onMsg(cmd, fgets(len));
                                break;
                            case 0x51:
                                microsecPerBeat = read24();
                                onMsg("tempo", { tempo: (60 / microsecPerBeat) * 1e6 });
                                break;
                            case 0x54:
                                var _a = [
                                    fgetc(),
                                    fgetc(),
                                    fgetc(),
                                    fgetc(),
                                    fgetc(),
                                ], framerateAndhour = _a[0], min = _a[1], sec = _a[2], frame = _a[3], subframe = _a[4];
                                var framerate = [24, 25, 29, 30][framerateAndhour & 0x60];
                                var hour = framerate & 0x1f;
                                onMsg("SMPTE", {
                                    hour: hour,
                                    min: min,
                                    sec: sec,
                                    frame: frame,
                                    subframe: subframe
                                });
                                break;
                            case 0x58:
                                cmd = "timeSig";
                                onMsg(cmd, {
                                    qnpm: fgetc(),
                                    beat: fgetc(),
                                    ticks: fgetc(),
                                    measure: fgetc()
                                });
                                break;
                            case 0x59:
                                info.push({
                                    scale: fgetc() & 0x7f
                                });
                                info.push({
                                    majminor: fgetc() & 0x7f
                                });
                                cmd = "note pitch change";
                                break;
                            case 0x2f:
                                //END OF TRACK;
                                onMsg("end of track");
                                break;
                            default:
                                cmd = "unkown " + meta;
                                info.push({ "type:": meta, info: fgets(len) });
                                break;
                        }
                        // console.log("meta ", msg, cmd, info);
                        break;
                    case 0xf2:
                        onMsg("Song Position Pointer", read16());
                    case 0xf1:
                        onMsg("smpte:", [fgetc(), fgetc(), fgetc(), fgetc()]);
                        break;
                    case 0xf3:
                    case 0xf4:
                        onMsg("icd,", fgetc());
                        break;
                    case 0xf6:
                        console.log("list tunes");
                        break;
                    case 0xf7:
                    case 0xf8:
                        onMsg("timing");
                        break;
                    case 0xfa:
                        onMsg("start");
                        break;
                    case 0xfb:
                        onMsg("Continue");
                        break;
                    case 0xfc:
                        onMsg("stop");
                        break;
                    default:
                        console.log(msg);
                        console.log("wtf");
                        break;
                }
            }
            else {
                var channel = msg & 0x0f;
                var cmd = msg & 0xf0;
                switch (cmd) {
                    case 0x80:
                        onMsg("noteOff", {
                            channel: channel,
                            note: fgetc(),
                            vel: fgetc()
                        });
                        break;
                    case 0x90:
                        onMsg("noteOn", {
                            channel: channel,
                            note: fgetc(),
                            vel: fgetc()
                        });
                        break;
                    case 0xa0:
                        onMsg("polyaftertouch", {
                            channel: channel,
                            note: fgetc(),
                            pressure: fgetc()
                        });
                        break;
                    case 0xb0:
                        onMsg("channelMode", {
                            channel: channel,
                            cc: fgetc(),
                            val: fgetc()
                        });
                        break;
                    case 0xc0:
                        onMsg("Program", {
                            channel: channel,
                            program: fgetc()
                        });
                        break;
                    case 0xe0:
                        onMsg("pitchWhell", {
                            channel: channel,
                            note: fgetc(),
                            pressure: fgetc()
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }
    function tick() {
        g_time = g_time + division / 2;
        readAt(g_time);
    }
    return {
        tracks: tracks,
        readAt: readAt,
        get time() {
            return g_time / this.ticksPerSecond;
        },
        get ticksPer4n() {
            return this.division;
        },
        get tempo() {
            return (60 * 1000) / microsecPerBeat;
        },
        get milisecondPerEigthNote() {
            return microsecPerBeat / 1000 / 2; /* qn per minute */
        },
        get ticksPerSecond() {
            return microsecPerBeat / division / 1000;
        },
        readAll: function () { return readAt(Infinity); },
        tick: tick,
        start: function () {
            function loop() {
                tick();
                setTimeout(loop, microsecPerBeat / 1000 / 2);
            }
            loop();
        },
        addListener: function (handler) { return (cb = handler); },
        pump: function (u8a) { return reader.pump(u8a); }
    };
}
exports.readMidi = readMidi;
