export function readMidi(buffer) {
    const reader = bufferReader2(buffer);
    const { fgetc, btoa, read24, readString, read32, readVarLength, read16 } = reader;
    const chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
    const headerLength = read32();
    const format = read16();
    const ntracks = read16();
    const division = read16();
    const tracks = [];
    const limit = buffer.byteLength;
    let lasttype;
    function readNextEvent() {
        const { fgetc, read24, readString, read32, readVarLength, read16 } = reader;
        let type = fgetc();
        if (type == null)
            return;
        if ((type & 0xf0) == 0xf0) {
            switch (type) {
                case 0xff:
                    const meta = fgetc();
                    switch (meta) {
                        case 0x51:
                            return ['tempo', read24()];
                        case 0x54:
                            return ['smpte', fgetc(), fgetc(), fgetc(), fgetc(), fgetc()];
                        case 0x58:
                            return ['timedivision', fgetc(), fgetc(), fgetc(), fgetc()];
                        case 0x27:
                            return ['eot'];
                        default:
                            return ["meta", readString(readVarLength())];
                    }
                    break;
                case 0xf0:
                case 0xf7:
                    return ['sysex', readString(readVarLength())];
                default:
                    break;
            }
        }
        else {
            let param;
            if (0 === (type & 0x80)) {
                param = type;
                type = lasttype;
            }
            else {
                param = fgetc();
                lasttype = type;
            }
            switch (type >> 4) {
                case 0x0c:
                case 0x0d:
                    return [type, param, 0];
                default:
                    return [type, param, fgetc()];
            }
        }
    }
    while (reader.offset < limit) {
        fgetc(), fgetc(), fgetc(), fgetc();
        let t = 0;
        let mhrkLength = read32();
        const endofTrack = reader.offset + mhrkLength;
        const track = [];
        while (reader.offset < endofTrack) {
            t += readVarLength();
            const nextEvent = readNextEvent();
            if (nextEvent[0] == 'eot')
                break;
            track.push([t, ...nextEvent]);
        }
        tracks.push(track);
        reader.offset = endofTrack;
    }
    return { division, tracks, ntracks };
}
function bufferReader2(bytes) {
    let _offset = 0;
    const fgetc = () => bytes[_offset++];
    const read32 = () => (fgetc() << 24) | (fgetc() << 16) | (fgetc() << 8) | fgetc();
    const read16 = () => (fgetc() << 8) | fgetc();
    const read24 = () => (fgetc() << 16) | (fgetc() << 8) | fgetc();
    function readVarLength() {
        let v = 0;
        let n = fgetc();
        v = n & 0x7f;
        while (n & 0x80) {
            n = fgetc();
            v = (v << 7) | (n & 0x7f);
        }
        return v;
    }
    function btoa() {
        const code = fgetc();
        return code == 32
            ? " "
            : code >= 65 && code <= 122
                ? `ABCDEFGHIJKLMNOPQRSTUVWXYZ......abcdefghijklmnopqrstuvwxyz`.split("")[code - 65]
                : code;
    }
    const readString = (n) => {
        let str = "";
        while (n--)
            str += btoa();
        return str;
    };
    return {
        get offset() {
            return _offset;
        },
        set offset(o) {
            _offset = o;
        },
        fgetc,
        read32,
        read24,
        read16,
        readVarLength,
        readString,
        btoa
    };
}
