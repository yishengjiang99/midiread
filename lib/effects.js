// import * from "webmidi";
// import { useReducer } from "https://unpkg.com/react";
// const enum RAT {
// 	GMSystemOn,
// 	ResetControllers
// };
// const PowerOnState={
// 	on: true,
// 	volume: 100,
// 	expressonion: 127,
// 	pan: 64,
// 	bankSelect:0,
// 	programChange:0,
// 	channelPressure:new Uint8Array(16).fill(0),
// };
// const controllerDefaults={	modulation:0,
// 	expression: 127,
// 	Pedals:0,
// 	pitchBend:65};
// function midiStateReducer(state, action) {
//   switch (action.type) {
// 		case RAT.GMSystemOn:
// 			return PowerOnState;
// 		case RAT.ResetControllers:
// 			return {
// 				...state,
// 				controllerDefaults
// 			}
//   }
// }
// function MidiPlayer() {
//   const [midiState, dispatch] = useReducer(midiStateReducer,{
//     on: false,
//     volume: 100,
//     expressonion: 127,
//     pan: 64,
//   });
// }
// let state = {
//   on: false,
// };
