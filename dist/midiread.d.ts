declare interface MidiReader {
    readAt: any;
    callback: any;
    ticksPer4n: any;
    offset?: any;
    format?: number;
    ntracks?: number;
    division?: number;
    tracks?: {
        endofTrack: number;
        offset: number;
        time: number;
        program: number;
    }[];
    time?: number;
    tempo?: number;
    milisecondPerEigthNote?: number;
    ticksPerSecond?: number;
    readAll?: () => void;
    tick?: () => void;
    start?: () => void;
    stop?: () => boolean;
    meta?: {
        chunkType: string;
        headerLength: number;
        format: number;
        ntracks: number;
        division: number;
    };
    addListener?: (handler: any) => any;
    pump?: (u8a: Uint8Array) => void;
}
declare type cbfn = (cmd: string, obj: any, time: number) => void;
export declare const ccs: {
    1: string;
    2: string;
    7: string;
    8: string;
    10: string;
    11: string;
    64: string;
    65: string;
    71: string;
    74: string;
    92: string;
    93: string;
    94: string;
    95: string;
};
export declare function fetchAwaitBuffer(url: string): Promise<Uint8Array>;
export declare function readMidi(buffer: Uint8Array, cb?: cbfn): MidiReader;
export declare function readAllEvents(ab: Uint8Array): Promise<{
    events: any[];
    programs: any[];
    notes: any[];
}>;
export declare function bufferReader(buffer: Uint8Array): {
    pump: (ab: Uint8Array) => void;
    offset: number;
    fgetc: () => number;
    btoa: () => string;
    read32: () => number;
    read16: () => number;
    read24: () => number;
    fgetnc: (n: number) => number[];
    readVarLength: () => number;
    fgets: (n: number) => string;
};
export {};
