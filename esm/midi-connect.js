export async function bindMidiAccess(port, onMidiMessage) {
    const midiAccess = await navigator.requestMIDIAccess();
    const midiInputs = Array.from(midiAccess.inputs.values());
    const midiOutputs = Array.from(midiAccess.outputs.values());
    midiInputs.forEach((input, idx) => {
        input.onmidimessage = ({ data, receivedTime }) => {
            if (port && data[0] & 0x80)
                port.postMessage([data, receivedTime]);
            else {
                console.log(data);
            }
            if (onMidiMessage)
                onMidiMessage(data);
        };
    });
    return [midiInputs, midiOutputs];
}
export function midiSelectBtn({ msgport, parentElement, onMidiMessage, onPortsGot, }) {
    onPortsGot = onPortsGot || console.log;
    let midiBtn = document.createElement("button");
    midiBtn.innerHTML = "click";
    midiBtn.onclick = async () => {
        let inputs, outputs;
        try {
            [inputs, outputs] = await bindMidiAccess(msgport, onMidiMessage);
        }
        catch (e) {
            throw e;
            midiBtn.parentElement.innerHTML = "MIDI access not granted";
        }
        onPortsGot && onPortsGot([inputs, outputs]);
        midiBtn.hidden = true;
    };
    parentElement.append(midiBtn);
    return midiBtn;
}
export const midiWriteSelect = ({ outputs, onselect }) => {
    let outputsend = outputs[1];
    const midiWriteForm = document.querySelector("form");
    outputs.forEach((output, idx) => {
        midiWriteForm.innerHTML += `<input ${idx == 1 ? "checked" : ""}
             type="radio" name="midiwrite" 
             value=${idx}>  
             ${output.name}
             </input>`;
    });
    midiWriteForm.innerHTML += "<input type=submit />";
    midiWriteForm.oninput = (e) => {
        if (!midiWriteForm.midiwrite.value)
            return;
        const outp = outputs[parseInt(midiWriteForm.midiwrite.value)];
        outp.open(() => {
            outputsend = outp;
        });
        return false;
    };
    midiWriteForm.onsubmit = async (e) => {
        e.preventDefault();
        if (!midiWriteForm.midiwrite.value)
            return;
        const outp = outputs[parseInt(midiWriteForm.midiwrite.value)];
        outputsend = await outp.open();
        onselect(outputsend);
        return false;
    };
};
