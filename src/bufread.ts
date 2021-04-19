export function bufferReader(buffer: Uint8Array) {
  let _offset = 0,
    eos = false;
  const EOS = "OES";
  let _buf = [buffer];
  let bl = buffer.byteLength;
  const fgetc = (): number => {
    if (eos) return 0x00;
    const ret = _buf[0][_offset];
    _offset++;
    ({ bl, eos } = checkeos(_offset, bl, _buf, eos));
    return ret;
  };
  const btoa = () => String.fromCharCode(fgetc());
  const read32 = () =>
    (fgetc() << 24) | (fgetc() << 16) | (fgetc() << 8) | fgetc();
  const read16 = () => (fgetc() << 8) | fgetc();
  const read24 = () => (fgetc() << 16) | (fgetc() << 8) | fgetc();
  const fgets = (n: number) => {
    let s = "";
    while (n-- > 0) s += btoa();
    debugger;
    return s;
  };
  const fgetnc = (n: number): number[] =>
    n > 1 ? [fgetc(), ...fgetnc(n - 1)] : [fgetc()];
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
    pump: (ab: Uint8Array) => {
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
function checkeos(
  _offset: number,
  bl: number,
  _buf: Uint8Array[],
  eos: boolean
) {
  if (_offset > bl) {
    _buf.shift();
    if (_buf[0]) {
      bl = _buf[0].length;
    } else {
      eos = true;
    }
  }
  return { bl, eos };
}
