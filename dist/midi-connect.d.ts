/// <reference types="webmidi" />
export declare function bindMidiAccess(port: any, onMidiMessage: any): Promise<(WebMidi.MIDIInput[] | WebMidi.MIDIOutput[])[]>;
export declare function midiSelectBtn({ msgport, parentElement, onMidiMessage, onPortsGot, }: {
    msgport?: MessagePort;
    parentElement?: HTMLElement;
    onMidiMessage?: any;
    onPortsGot?: any;
}): HTMLButtonElement;
export declare const midiWriteSelect: ({ outputs, onselect }: {
    outputs: any;
    onselect: any;
}) => void;
