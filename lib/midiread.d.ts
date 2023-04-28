export declare function readMidi(buffer: {
    byteLength: any;
}): {
    headerInfo: {
        chunkType: string;
        headerLength: number;
        format: number;
    };
    division: number;
    tracks: any[];
    ntracks: number;
    presets: any[];
    tempos: any[];
    time_base: {
        relative_ts: number;
        numerator: number;
        denum: number;
        ticksPerBeat: number;
        eigthNotePerBeat: number;
    };
};
export declare function bufferReader2(bytes: any): {
    offset: number;
    fgetc: () => any;
    read32: () => number;
    read24: () => number;
    read16: () => number;
    readVarLength: () => number;
    readString: (n: any) => string;
    btoa: () => string;
};
