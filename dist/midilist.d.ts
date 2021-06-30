declare type InnerHTML = (string | HTMLElement)[] | HTMLElement | string;
export declare function mkdiv(type: string, attr?: InnerHTML | any | null, children?: InnerHTML | null): HTMLElement;
declare type stdcb = (str: string) => void;
declare type logdivRet = {
    stdout: stdcb;
    stderr: stdcb;
    errPanel: HTMLElement;
    infoPanel: HTMLElement;
};
export declare function logdiv(): logdivRet;
export declare function wrapDiv(div: string | HTMLElement, tag: string, attrs?: {}): HTMLElement;
export declare function wrapList(divs: HTMLElement[]): HTMLElement;
export declare function fetchAwaitBuffer(url: any): Promise<ArrayBuffer>;
export declare const cdnhost = "https://grep32bit.blob.core.windows.net/midi";
export declare const mlist: () => Promise<unknown>;
export declare const mk_link: (url: any, linkclicked: any) => HTMLElement;
export declare const midipanel: (container: any, playMidi: any) => Promise<string[]>;
export {};
