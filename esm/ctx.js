export async function initAudioCtx() {
    const ctx = new AudioContext();
    await ctx.audioWorklet.addModule(URL.createObjectURL(script));
    const proc = new AudioWorkletNode(ctx, "pt");
    return {
        ctx,
        proc,
    };
}
function procccode() {
    return `class PtProc extends AudioWorkletProcessor {
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
registerProcessor("pt", PtProc);`;
}
const script = new Blob([procccode()], { type: "application/javascript" });
