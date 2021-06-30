import { bindMidiAccess, msgToPort } from "./midi-connect.js";
const script = new Blob([
    `
class PtProc extends AudioWorkletProcessor {
	constructor() {
		super();
		this.port.addEventListener("message",function({data}){
			this.port.postMessage(data);
		})
	}
	process([[inputList]], [[outputList]]) {
		//outputList.set(inputList);
		return true;
	}
}
registerProcessor("pt", PtProc);`,
], { type: "application/javascript" });
async function inits() {
    const ctx = new AudioContext();
    const url = URL.createObjectURL(script);
    await ctx.audioWorklet.addModule(URL.createObjectURL(script));
    const proc = new AudioWorkletNode(ctx, "pt");
    return {
        ctx,
        proc,
    };
}
let inputs, outputs;
let midiBtn = document.createElement("button");
midiBtn.innerHTML = "click";
document.body.append(midiBtn);
midiBtn.onclick = async () => {
    const ports = await bindMidiAccess();
    inputs = ports[0];
    outputs = ports[1];
    const { proc } = await inits();
    proc.port.onmessage = (e) => (document.body.innerHTML += JSON.stringify(e.data));
    msgToPort(inputs, proc.port);
    for (const output of outputs) {
        document.body.innerHTML = output.name + document.body.innerHTML;
    }
};
describe("midiconnect", () => {
    it("echos from a list of input ports", async () => {
        // const ports = await bindMidiAccess();
        // inputs = ports[0];
        // outputs = ports[1];
        // console.assert(inputs.length);
    });
    it("posting msg to port", async () => {
        // const { proc } = await inits();
        // proc.port.onmessage = (e) => console.log(e.data);
        // msgToPort(inputs, proc.port);
        // for (const output of outputs) {
        //   document.body.innerHTML = output.toString() + document.body.innerHTML;
        // }
    });
});
