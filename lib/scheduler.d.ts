export declare function scheduler(midi_u8: any, cb: any): Promise<{
    pause: () => void;
    rwd: (amt: any) => void;
    run: () => Promise<void>;
    resume: () => void;
}>;
