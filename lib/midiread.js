"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMidi = void 0;
function readMidi(buffer) {
    var reader = bufferReader2(buffer);
    var fgetc = reader.fgetc, btoa = reader.btoa, read24 = reader.read24, readString = reader.readString, read32 = reader.read32, readVarLength = reader.readVarLength, read16 = reader.read16;
    var chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
    var headerLength = read32();
    var format = read16();
    var ntracks = read16();
    var division = read16();
    var tracks = [];
    var limit = buffer.byteLength;
    var lasttype;
    function readNextEvent() {
        var fgetc = reader.fgetc, read24 = reader.read24, readString = reader.readString, read32 = reader.read32, readVarLength = reader.readVarLength, read16 = reader.read16;
        var type = fgetc();
        if (type == null)
            return;
        if ((type & 0xf0) == 0xf0) {
            switch (type) {
                case 0xff:
                    var meta = fgetc();
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
            var param = void 0;
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
        var t = 0;
        var mhrkLength = read32();
        var endofTrack = reader.offset + mhrkLength;
        while (reader.offset < endofTrack) {
            t += readVarLength();
            var nextEvent = readNextEvent();
            if (nextEvent[0] == 'eot')
                break;
            tracks.push(__spreadArray([t], nextEvent));
        }
        tracks.push({ endofTrack: endofTrack, offset: reader.offset, time: 0, program: 0 });
        reader.offset = endofTrack;
    }
    return { division: division, tracks: tracks, ntracks: ntracks };
}
exports.readMidi = readMidi;
function bufferReader2(bytes) {
    var _offset = 0;
    var fgetc = function () { return bytes[_offset++]; };
    var read32 = function () {
        return (fgetc() << 24) | (fgetc() << 16) | (fgetc() << 8) | fgetc();
    };
    var read16 = function () { return (fgetc() << 8) | fgetc(); };
    var read24 = function () { return (fgetc() << 16) | (fgetc() << 8) | fgetc(); };
    function readVarLength() {
        var v = 0;
        var n = fgetc();
        v = n & 0x7f;
        while (n & 0x80) {
            n = fgetc();
            v = (v << 7) | (n & 0x7f);
        }
        return v;
    }
    function btoa() {
        var code = fgetc();
        return code == 32
            ? " "
            : code >= 65 && code <= 122
                ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ......abcdefghijklmnopqrstuvwxyz".split("")[code - 65]
                : code;
    }
    var readString = function (n) {
        var str = "";
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
        fgetc: fgetc,
        read32: read32,
        read24: read24,
        read16: read16,
        readVarLength: readVarLength,
        readString: readString,
        btoa: btoa
    };
}
