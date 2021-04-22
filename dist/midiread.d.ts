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
export declare function readMidi(buffer: Uint8Array): MidiReader;
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
