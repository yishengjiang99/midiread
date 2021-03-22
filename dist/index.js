import { bufferReader } from "./bufread.js";
export function readMidi(buffer, onMsg) {
    const reader = bufferReader(buffer);
    const { fgetc, offset, btoa, read32, read16, read24, readVarLength, fgets, } = reader;
    const chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
    const headerLength = read32();
    const format = read16();
    const ntracks = read16();
    const division = read16();
    onMsg("header", { chunkType, headerLength, format, ntracks, division });
    let g_time = -1000;
    const tracks = [];
    const limit = buffer.byteLength;
    const tempos = [];
    const metainfo = [];
    const timesigs = [];
    while (reader.offset < limit) {
        const mhrk = [btoa(), btoa(), btoa(), btoa()].join("");
        let mhrkLength = read32();
        const endofTrack = reader.offset + mhrkLength;
        tracks.push({ endofTrack, offset: reader.offset, time: 0, program: 0 });
        reader.offset = endofTrack;
    }
    function readAt(g_time) {
        for (const track of tracks) {
            reader.offset = track.offset;
            while (track.time <= g_time && reader.offset < track.endofTrack) {
                track.time += readVarLength();
                readMessage(track);
            }
            track.offset = reader.offset;
        }
        function readMessage(track) {
            const msg = fgetc();
            if (!msg)
                return false;
            let meta;
            let info = [];
            if (msg >= 0xf0) {
                switch (msg) {
                    case 0xff:
                        meta = fgetc();
                        var len = readVarLength();
                        let cmd = "";
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
                                const tempo = read24();
                                onMsg("tempo", tempo);
                                break;
                            case 0x54:
                                const [framerateAndhour, min, sec, frame, subframe] = [
                                    fgetc(),
                                    fgetc(),
                                    fgetc(),
                                    fgetc(),
                                    fgetc(),
                                ];
                                const framerate = [24, 25, 29, 30][framerateAndhour & 0x60];
                                const hour = framerate & 0x1f;
                                onMsg("SMPTE", {
                                    framerate,
                                    hour,
                                    min,
                                    sec,
                                    frame,
                                    subframe,
                                });
                                break;
                            case 0x58:
                                cmd = "timesig";
                                onMsg(cmd, {
                                    qnpm: fgetc(),
                                    beat: fgetc(),
                                    ticks: fgetc(),
                                    measure: fgetc(),
                                });
                                break;
                            case 0x59:
                                info.push({
                                    scale: fgetc() & 0x7f,
                                });
                                info.push({
                                    majminor: fgetc() & 0x7f,
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
                const channel = msg & 0x0f;
                const cmd = msg >> 4;
                switch (cmd) {
                    case 0x08:
                        onMsg("noteOff", {
                            channel: channel,
                            note: fgetc(),
                            vel: fgetc(),
                        });
                        break;
                    case 0x09:
                        onMsg("noteOn", {
                            channel: channel,
                            note: fgetc(),
                            vel: fgetc(),
                        });
                        break;
                    case 0x0a:
                        onMsg("polyaftertouch", {
                            channel: channel,
                            note: fgetc(),
                            pressure: fgetc(),
                        });
                        break;
                    case 0x0b:
                        onMsg("channelMode", {
                            channel: channel,
                            cc: fgetc(),
                            val: fgetc(),
                        });
                        break;
                    case 0x0c:
                        onMsg("Program", {
                            channel: channel,
                            program: fgetc(),
                        });
                        break;
                    case 0x0e:
                        onMsg("pitchWhell", {
                            channel: channel,
                            note: fgetc(),
                            pressure: fgetc(),
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }
    return {
        readAt,
        tick: () => {
            g_time = g_time + 155;
            readAt(g_time);
        },
        pump: (u8a) => reader.pump(u8a),
    };
}
