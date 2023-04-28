
const DEFAULT_TEMPO = {
  tempo: 500000,
  t: 0
};
enum STATUS_BYTES {
  SEQ_NUM,
  TEXT,
  COPYRIGHT_NOTICE,
  TRACK_NAME,
  INSTRUMENT_NAME,
  LYRICS,
  MARKERS,
  CUE_POINT,
  CHANNEL_PREFIX = 0x20,
  END_OF_TRACK = 0x2f,
  SET_TEMPO = 0x51,
  SMPTE_OFFSET = 0x54,
  TIME_SIG = 0x58,
  KEY_SIG = 0X59,
  META_MSG = 0xff,
}
export function readMidi(buffer: Uint8Array): { headerInfo: { chunkType: string; headerLength: number; format: number; }; division: number; tracks: any[]; ntracks: number; presets: any[]; tempos: any[]; time_base: { relative_ts: number; numerator: number; denum: number; ticksPerBeat: number; eigthNotePerBeat: number; }; } {
  const reader = bufferReader2(buffer);
  const { fgetc, btoa, read32, readVarLength, read16, read24, readString } =
    reader;
  const chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
  const headerLength = read32();

  const format = read16();
  const ntracks = read16();
  const division = read16();
  const headerInfo = { chunkType, headerLength, format };
  const tracks = [];
  const DEFAULT_TIMEBASE = {
    relative_ts: 4, numerator: 4, denum: 4, ticksPerBeat: division, eigthNotePerBeat: 8
  };
  const sysex_mask = 0xf0;

  const limit = buffer.byteLength;
  let lasttype: any;

  const presets = [];
  const tempos = [];
  let time_base = DEFAULT_TIMEBASE;
  while (reader.offset < limit)
  {
    console.log(fgetc(), fgetc(), fgetc(), fgetc());
    let t = 0, delay = 0, status_byte;
    const mhrkLength = read32();
    const endofTrack = reader.offset + mhrkLength;
    const track = [];
    console.log(t);
    const pushEvent = (payload) => track.push({ t, delay, ...payload })
    while (reader.offset < limit && reader.offset < endofTrack)
    {
      delay = readVarLength();
      status_byte = fgetc();

      if (status_byte & sysex_mask)
      {
        switch (status_byte)
        {
          case STATUS_BYTES.META_MSG: {
            const meta = fgetc();
            const len = readVarLength();
            switch (meta)
            {
              case STATUS_BYTES.SET_TEMPO:
                const mspqn = read24();
                pushEvent({ tempo: mspqn });
                break;
              case STATUS_BYTES.TIME_SIG:
                const [numerator, denomP2, ticksPerBeat, eigthNotePerBeat] = [fgetc(), fgetc(), fgetc(), fgetc()];
                const denum = Math.pow(2, denomP2);
                const relative_ts = numerator / denum * 4;
                time_base = { relative_ts, numerator, denum, ticksPerBeat, eigthNotePerBeat };
                pushEvent({ time_base });
                break;
              case STATUS_BYTES.KEY_SIG:
                pushEvent({ meta, key_sig: [fgetc(), fgetc()] });
                break;
              default:
                pushEvent({ meta, payload: readString(len) });
                break;
            }
          }
          case 0xf0://sysex start
          case 0xf7: //sysex end
            pushEvent({ sysex: readString(readVarLength()) })
            break;
          default:
            pushEvent({ type: status_byte, system: readString(readVarLength()) });
            break;
        }
      } else
      {
        let param: any;
        console.log(status_byte);
        if (0 === (status_byte & 0x80))
        {
          param = status_byte;
          //status_byte = lasttype;
        } else
        {
          param = fgetc();
          lasttype = status_byte;
        }
        switch (status_byte >> 4)
        {
          case 0x0c: //read 2 bytes
          case 0x0d:
            pushEvent({ channel: [status_byte, param, 0] });
            break;
          default:
            pushEvent({ channel: [status_byte, param, fgetc()] });

            break;
        }
      }
      t += delay;
    }
    for (const e of track) console.log(e)
    tracks.push(track)
    console.log(track)
  }
  return { headerInfo, division, tracks, ntracks, presets, tempos, time_base };
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
    v = n & 127;
    while (n & 128)
    {
      n = fgetc();
      v = (v << 7) | (n & 127);
    }
    return v;
  }
  function btoa() {
    return String.fromCharCode(fgetc());
  }
  const readString = (n) => {
    let str = "";
    while (n--) str += btoa();
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
    btoa,
  };
}

// const Fs = require("fs");
// const Path = require("path");


// const a = readMidi(new Uint8Array(Fs.readFileSync("../song.mid")));
// console.log(a);