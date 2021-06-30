"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAudioCtx = void 0;
async function initAudioCtx() {
    const ctx = new AudioContext();
    await ctx.audioWorklet.addModule(URL.createObjectURL(script));
    const proc = new AudioWorkletNode(ctx, "pt");
    return {
        ctx,
        proc,
    };
}
exports.initAudioCtx = initAudioCtx;
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
