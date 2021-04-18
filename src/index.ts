import { bufferReader } from './bufread.js';
declare type cbfn = (cmd: string, obj: any, time: number) => void;
export function readMidi(buffer: Uint8Array, callb?: cbfn) {
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
  const chunkType = [btoa(), btoa(), btoa(), btoa()].join('');
  const headerLength = read32();
  const format = read16();
  const ntracks = read16();
  const division = read16();
  let cb: cbfn =
    callb ||
    function (cmd, obj, time) {
      console.log(cmd, obj, time);
    };

  console.log(division);

  let g_time = 0;
  type Track = {
    endofTrack: number;
    offset: number;
    time: number;
    program: number;
  };

  const tracks: Track[] = [];
  const limit = buffer.byteLength;
  let tempo;
  let microsecPerBeat = 500000;
  let bpm;
  const metainfo: any[] = [];
  const timesigs: {
    qnpm: number | false;
    beat: number | false;
    ticks: number | false;
    measure: number | false;
  }[] = [];

  while (reader.offset < limit) {
    const mhrk = [btoa(), btoa(), btoa(), btoa()].join('');
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
  function readAt(g_time: number) {
    for (const track of tracks) {
      reader.offset = track.offset;
      while (reader.offset < track.endofTrack) {
        const { value, rollback } = readVarLengthWithRollback(reader);
        if (track.time + value <= g_time) {
          track.time += value;
          readMessage(track);
        } else {
          rollback();
          break;
        }
      }
      track.offset = reader.offset;
    }
    function readMessage(track: { program: number | boolean; time: number }) {
      function onMsg(cmd: string, obj: any = '') {
        cb(cmd, obj ?? {}, track.time);
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
            let cmd = '';
            switch (meta) {
              case 0x01:
                cmd = 'Text Event';
              case 0x02:
                cmd = cmd || 'Copyright Notice';
              case 0x03:
                cmd = cmd || 'Sequence/Track Name';
              case 0x04:
                cmd = cmd || 'Instrument Name';
              case 0x05:
                cmd = cmd || 'Lyric';
              case 0x06:
                cmd = cmd || 'Marker';
              case 0x07:
                cmd = cmd || 'queue ptr';
                onMsg(cmd, fgets(len));
                break;
              case 0x51:
                microsecPerBeat = read24();

                onMsg('tempo', { tempo: (60 / microsecPerBeat) * 1e6 });
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
                onMsg('SMPTE', {
                  hour,
                  min,
                  sec,
                  frame,
                  subframe,
                });
                break;
              case 0x58:
                cmd = 'timeSig';

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
                cmd = 'note pitch change';
                break;
              case 0x2f:
                //END OF TRACK;
                onMsg('end of track');
                break;
              default:
                cmd = 'unkown ' + meta;
                info.push({ 'type:': meta, info: fgets(len) });
                break;
            }
            // console.log("meta ", msg, cmd, info);
            break;
          case 0xf2:
            onMsg('Song Position Pointer', read16());
          case 0xf1:
            onMsg('smpte:', [fgetc(), fgetc(), fgetc(), fgetc()]);
            break;
          case 0xf3:
          case 0xf4:
            onMsg('icd,', fgetc());
            break;
          case 0xf6:
            console.log('list tunes');
            break;
          case 0xf7:
          case 0xf8:
            onMsg('timing');
            break;
          case 0xfa:
            onMsg('start');
            break;
          case 0xfb:
            onMsg('Continue');
            break;
          case 0xfc:
            onMsg('stop');
            break;
          default:
            console.log(msg);
            console.log('wtf');
            break;
        }
      } else {
        const channel = msg & 0x0f;
        const cmd = msg & 0xf0;
        switch (cmd) {
          case 0x80:
            onMsg('noteOff', {
              channel: channel,
              note: fgetc(),
              vel: fgetc(),
            });
            break;
          case 0x90:
            onMsg('noteOn', {
              channel: channel,
              note: fgetc(),
              vel: fgetc(),
            });
            break;

          case 0xa0:
            onMsg('polyaftertouch', {
              channel: channel,
              note: fgetc(),
              pressure: fgetc(),
            });
            break;
          case 0xb0:
            onMsg('channelMode', {
              channel: channel,
              cc: fgetc(),
              val: fgetc(),
            });
            break;
          case 0xc0:
            onMsg('Program', {
              channel: channel,
              program: fgetc(),
            });
            break;
          case 0xe0:
            onMsg('pitchWhell', {
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
