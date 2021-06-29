import assert from "assert";

declare interface MidiReader {
  readAt: any;
  callback: any;
  ticksPer4n: any;
  offset?: any;
  format?: number;
  ntracks?: number;
  division?: number;
  tracks?: {
    endofTrack: number;
    offset: number;
    time: number;
    program: number;
  }[];
  time?: number;
  tempo?: number;
  milisecondPerEigthNote?: number;
  ticksPerSecond?: number;
  readAll?: () => void;
  tick?: () => void;
  start?: () => void;
  stop?: () => boolean;
  meta?: {
    chunkType: string;
    headerLength: number;
    format: number;
    ntracks: number;
    division: number;
  };
  addListener?: (handler: any) => any;
  pump?: (u8a: Uint8Array) => void;
}
declare type cbfn = (cmd: string, obj: any, time: number) => void;
const ccs = {
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
interface EventInfo {
  [key: string]: string | number | number[] | (number | string[]);
}
export async function  fetchAwaitBuffer(url:string){
  const ab=new Uint8Array(await (await fetch(url)).arrayBuffer());
  return readMidi(ab);
}
export function readMidi(buffer: Uint8Array): MidiReader {
  const reader = bufferReader(buffer);
  const {
    fgetc,
    offset,
    btoa,
    read32,
    read16,
    read24,
    readVarLength,
    fgets,
  } = reader;
  const chunkType = [btoa(), btoa(), btoa(), btoa()].join("");
  const headerLength = read32();
  const format = read16();
  const ntracks = read16();
  const division = read16();
  console.assert(reader.offset==14);
  return;
  let cb: cbfn = function (cmd, obj, time) {
    console.log(cmd, obj, time);
  };

  let g_time = 0;
  type Track = {
    endofTrack: number;
    offset: number;
    time: number;
    program: number;
  };

  const tracks: Track[] = [];
  const limit = buffer.byteLength;
  let tempo;debugger;
  let microsecPerBeat = 500000;
  
for(let i =0;i<ntracks;i++){
   console.log( btoa(), btoa(), btoa(), btoa());
    let mhrkLength = read32();
    const endofTrack = reader.offset + mhrkLength;
    tracks.push({ endofTrack, offset: reader.offset, time: 0, program: 0 });
    reader.offset = endofTrack;
  }
  function readVarLengthWithRollback(_reader) {
    const offsettt = _reader.offset;

    return {
      value: _reader.readVarLength(),
      rollback: () => (_reader.offset = offsettt),
    };
  }
  function readMessage(
    track: { program: number | boolean; time: number },
    trackId
  ) {
   async function onMsg(cmd: string, obj: EventInfo) {
      obj = { ...obj, trackId }; // trackId;
      await cb(cmd, obj, track.time);
    }
    const msg = fgetc();
    if (!msg) return false;
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
              onMsg(cmd, { text: fgets(len) });
              break;
            case 0x51:
              microsecPerBeat = read24();

              onMsg("tempo", { tempo: (60 / microsecPerBeat) * 1e6 });
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
                hour,
                min,
                sec,
                frame,
                subframe,
              });
              break;
            case 0x58:
              cmd = "timeSig";

              onMsg(cmd, {
                qnpm: fgetc(),
                beat: fgetc(),
                ticks: fgetc(),
                measure: fgetc(),
              });

              break;
            case 0x59:
              const byte = fgetc();
              onMsg("note pitch change", {
                major: byte & 0x80,
                minor: byte & 0x79,
              });

              break;
            case 0x2f:
              //END OF TRACK;
              onMsg("event", { info: "end of track" });
              break;
            default:
              cmd = "unkown " + meta;
              info.push({ "type:": meta, info: fgets(len) });
              break;
          }
          // console.log("meta ", msg, cmd, info);
          break;
        case 0xf2:
          onMsg("Song Position Pointer", { data: read16() });
        case 0xf1:
          onMsg("smpte:", { smpte: [fgetc(), fgetc(), fgetc(), fgetc()] });
          break;
        case 0xf3:
        case 0xf4:
          fgetc();
          break;
        case 0xf6:
          console.log("list tunes");
          break;
        case 0xf7:
        default:
          console.log(msg);
          break;
      }
    } else {
      const channel = msg & 0x0f;
      const cmd = msg & 0xf0;
      switch (cmd) {
        case 0x90:
          const [note, vel] = [fgetc(), fgetc()];
          if (vel == 0) {
            onMsg("noteOff", {
              channel: channel,
              note: note,
              vel: vel,
            });
          } else {
            onMsg("noteOn", {
              channel: channel,
              note: fgetc(),
              vel: fgetc(),
            });
          }
          break;
        case 0x80:
          onMsg("noteOff", {
            channel: channel,
            note: fgetc(),
            vel: fgetc(),
          });
          break;

        case 0xa0:
          onMsg("polyaftertouch", {
            channel: channel,
            note: fgetc(),
            pressure: fgetc(),
          });
          break;
        case 0xb0:
          const cc = fgetc();
          const val = fgetc();
          onMsg("channelMode", {
            channel: channel,
            cc,
            val,
            ccname: ccs[cc] ? ccs[cc] : "",
          });
          break;
        case 0xc0:
          onMsg("Program", {
            channel: channel,
            program: fgetc(),
          });
          break;
        case 0xe0:
          onMsg("pitchwheel", {
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
  function readAt(g_time: number) {
    let activeTracks = 0;
    tracks.forEach((track, trackId) => {
      reader.offset = track.offset;

      while (track.time <= g_time) {
        activeTracks++;
        const { value, rollback } = readVarLengthWithRollback(reader);
        track.time += value;
        readMessage(track, trackId);
      }
      track.offset = reader.offset;
    });
  }
  function tick() {
    g_time = g_time + division / 2;
console.log(g_time)
    readAt(g_time);
  }
  let stopped = false;

  return {
    format,
    ntracks,
    division,
    tracks,
    readAt,
    set callback(fn: cbfn) {
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
        if (stopped) return;
        tick();
        setTimeout(loop, microsecPerBeat / 1e3 / 2);
      }
      loop();
    },
    stop: () => (stopped = true),
    meta: { chunkType, headerLength, format, ntracks, division },
    addListener: (handler) => (cb = handler),
    pump: (u8a: Uint8Array) => reader.pump(u8a),
  };
}

export async function readAllEvents(ab: Uint8Array) {
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
        } else {
          break;
        }
      case "noteOff":
        if (pending[(obj.channel << 8) + obj.note]) {
          const onevent = pending[(obj.channel << 8) + obj.note];
          const dur = time - onevent.time;
          delete pending[(obj.channel << 8) + obj.note];
          notes[obj.channel].push(
            dur,
            onevent.time,
            obj.note,
            obj.channel,
            obj.velocity
          );
        }
        break;
    }
  };
  while (i < 100000) {
    r.readAt((i += r.ticksPer4n / 2));
  }
  return { events, programs, notes };
}
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
