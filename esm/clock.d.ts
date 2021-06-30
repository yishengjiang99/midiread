declare type Timer = {
    timeout: number;
    t: number;
    paused: boolean;
};
declare const timer: Timer;
declare function msg(timer: Timer, msg: string): void;
