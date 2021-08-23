import { scheduler } from "./node_modules/midiread/dist/scheduler.js";
(async () => {
  const url = self.location.hash.split("#")[1];
  const res = await fetch(url);
  const ab = await res.arrayBuffer();
  const {
    ctrls: { run, rwd, pause },
    totalTicks,
    tracks,
  } = await scheduler(new Uint8Array(ab), postMessage);
  // @ts-ignore
  postMessage({ totalTicks });
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
