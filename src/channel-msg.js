export function parseChannelMsg(data) {
  const channel = data[0] & 0x0f;
  const cmd = data[0] & 0x80;
  data.shift();
  switch (cmd) {
    case 0x80:
      onMsg("noteOff", {
        channel: channel,
        note: data.shift() & 0x7f,
        vel: data.shift() & 0x7f,
      });
      break;
    case 0x90:
      onMsg("noteOn", {
        channel: channel,
        note: data.shift() & 0x7f,
        vel: data.shift() & 0x7f,
      });
      break;

    case 0xa0:
      onMsg("polyaftertouch", {
        channel: channel,
        note: data.shift() & 0x7f,
        pressure: data.shift() & 0x7f,
      });
      break;
    case 0xb0:
      onMsg("channelMode", {
        channel: channel,
        cc: data.shift() & 0x7f,
        val: data.shift() & 0x7f,
      });
      break;
    case 0xc0:
      onMsg("Program", {
        channel: channel,
        program: data.shift() & 0x7f,
      });
      break;
    case 0xe0:
      onMsg("pitchbend", {
        channel: channel,
        note: data.shift() & 0x7f,
        pressure: data.shift() & 0x7f,
      });
      break;
    default:
      break;
  }
}
