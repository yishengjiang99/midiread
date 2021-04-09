"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.bufferReader = void 0;
function bufferReader(buffer) {
    var _offset = 0, eos = false;
    var EOS = "OES";
    var _buf = [buffer];
    var bl = buffer.byteLength;
    var fgetc = function () {
        var _a;
        if (eos)
            return 0x00;
        var ret = _buf[0][_offset];
        _offset++;
        (_a = checkeos(_offset, bl, _buf, eos), bl = _a.bl, eos = _a.eos);
        return ret;
    };
    var btoa = function () { return String.fromCharCode(fgetc()); };
    var read32 = function () {
        return (fgetc() << 24) | (fgetc() << 16) | (fgetc() << 8) | fgetc();
    };
    var read16 = function () { return (fgetc() << 8) | fgetc(); };
    var read24 = function () { return (fgetc() << 16) | (fgetc() << 8) | fgetc(); };
    var fgets = function (n) { return (n > 1 ? btoa() + fgets(n - 1) : btoa()); };
    var fgetnc = function (n) {
        return n > 1 ? __spreadArray([fgetc()], fgetnc(n - 1)) : [fgetc()];
    };
    var readVarLength = function () {
        var v = 0;
        var n = fgetc();
        v = n & 0x7f;
        while (n & 0x80) {
            n = fgetc();
            v = (v << 7) | (n & 0x7f);
        }
        return v;
    };
    return {
        pump: function (ab) {
            _buf.push(ab);
        },
        get offset() {
            return _offset;
        },
        set offset(offset) {
            _offset = offset;
        },
        fgetc: fgetc,
        btoa: btoa,
        read32: read32,
        read16: read16,
        read24: read24,
        fgetnc: fgetnc,
        readVarLength: readVarLength,
        fgets: fgets
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
    return { bl: bl, eos: eos };
}
