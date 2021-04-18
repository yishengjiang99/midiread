"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferReader = void 0;
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
    const fgets = (n) => (n > 1 ? btoa() + fgets(n - 1) : btoa());
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
