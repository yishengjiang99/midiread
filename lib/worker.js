"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_1 = require("./scheduler");
(async () => {
    const url = self.location.hash.split("#")[1];
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    const { run, rwd, pause } = await scheduler_1.scheduler(new Uint8Array(ab), postMessage);
    postMessage("r");
    onmessage = ({ data: { cmd, amt } }) => {
        switch (cmd) {
            case "start":
                run();
                break;
            case "pause":
                pause();
                break;
            case "resume":
                run();
                break;
            case "rwd":
                rwd(amt || 16);
                break;
            case "ff":
                break;
        }
    };
})();
