export async function bindMidiAccess(port, onMidiMessage) {
  const midiAccess = await navigator.requestMIDIAccess();
  const midiInputs = Array.from(midiAccess.inputs.values());
  const midiOutputs = Array.from(midiAccess.outputs.values());
  midiInputs.forEach((input) => {
    input.onmidimessage = ({ data, receivedTime }) => {
      if (port && data[0] & 0x80) port.postMessage([data, receivedTime]);
      else {
        console.log(data);
      }
      if (onMidiMessage) onMidiMessage(data);
    };
  });
  return [midiInputs, midiOutputs];
}
export function midiSelectBtn({
  msgport,
  parentElement,
  onMidiMessage,
  onPortsGot,
}: {
  msgport: MessagePort;
  parentElement: HTMLElement;
  onMidiMessage?;
  onPortsGot?;
}) {
  onPortsGot = onPortsGot || console.log;
  let midiBtn = document.createElement("button");
  midiBtn.innerHTML = "click";
  midiBtn.onclick = async () => {
    try {
      const [inputs, outputs] = await bindMidiAccess(msgport, onMidiMessage);
      onPortsGot && onPortsGot([inputs, outputs]);
      midiBtn.hidden = true;
    } catch (e) {
      throw e;
      midiBtn.parentElement.innerHTML = "MIDI access not granted";
    }
  };
  parentElement.append(midiBtn);
  return midiBtn;
}
