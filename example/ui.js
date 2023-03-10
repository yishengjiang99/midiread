import { logdiv, mkdiv } from "https://unpkg.com/mkdiv/mkdiv.js";

const { stderr, stdout, infoPanel } = logdiv();
document.body.appendChild(infoPanel);
const main = document.querySelector("main");
const meters = Array.from(main.querySelectorAll("meter"));

const labels = Array.from(main.querySelectorAll("label"));

const checkboxes = Array.from(
  document.querySelectorAll("input[type=checkbox]")
);
const [rx1, rx2, rx3] = Array.from(document.querySelectorAll("span"));

let sliders = Array.from(document.querySelectorAll("input[type='range']"));
sliders.forEach((s) => s.style.transform);
// [...labels, ...sliders].forEach((d) => d.remove());
window.onkeydown = () => {
  document.querySelector(".cover").style.display = "none";
  const ctx = new AudioContext();

  const div = document.querySelector("pre");
  const w = new Worker(
    "./worker.js#https://grep32bit.blob.core.windows.net/midi/Beethoven-Symphony5-1.mid",
    { type: "module" }
  );
  const ccs = new Uint8Array(128 * 16);
  for (let i = 0; i < 16; i++) {
    ccs[i * 16 + 7] = 100; //defalt volume
    ccs[i * 16 + 11] = 127; //default expression
    ccs[i * 16 + 10] = 64;
  }
  const programs = new Array(16);

  const timeslide = mkdiv("input", {
    type: "range",
    min: -2,
    max: 4000,
    value: -2,
  }).attachTo(main);
  w.onerror = console.trace;
  const gains = new Array(16).fill(new GainNode(ctx, { gain: 0 }));
  gains.forEach((g) => g.connect(ctx.destination));
  const one_over_128x4 = 1 / 128 / 128 / 128 / 128;
  w.onmessage = (e) => {
    if (e.data.totalTicks && e.data.presets) {
      stdout(e.data.totalTicks);
      w.postMessage({ cmd: "start" });
      for (const preset of e.data.presets) {
        const { pid, channel } = preset;
        const bkid = channel == 9 ? 128 : 0;
        programs[channel] = new OscillatorNode(ctx, {
          type: ["sawtooth", "sine", "square"][pid % 3],
        });
        programs[channel].connect(gains[channel]);
        programs[channel].start();
      }
    }
    if (e.data.channel) {
      const [a, b, c] = e.data.channel;
      const stat = a >> 4;
      const ch = a & 0x0f;
      const key = b & 0x7f,
        vel = c & 0x7f;
      stdout([ch, stat, key, vel].join(","));

      switch (stat) {
        case 0x0b: //chan set
          const idx = Object.keys(ccs[ch]).length;
          sliders[ch * 3 + idx].value = vel;
          labels[ch * 3 + idx].textContent = vel;
          ccs[ch * 128 + key] = vel;

          break;
        case 0x0a: //chan set
          sliders[ch * 3 + 1].value = vel;
          break;
        case 0x0c: //change porg
          labels[ch * 3 + 1].textContent = key;
          if (programs[ch]) programs[ch].disconnect();
          programs[ch] = new OscillatorNode(ctx, {
            frequency: 120,
            type: "sine",
          });

          programs[ch].connect(gains[ch]);
          programs[ch].start();
          //  sliders[ch * 2 + 2].value = vel;

          break;
        case 8:
          checkboxes[ch].setAttribute("checked", false);
          meters[ch * 2].value = "0";
          meters[ch * 2 + 1].value = -vel;
          gains[ch].gain.linearRampToValueAtTime(0, 0.01);
          break;
        case 9:
          if (vel == 0) {
            checkboxes[ch].removeAttribute("checked");
            meters[ch * 2].value = 0;
            gains[ch].gain.linearRampToValueAtTime(0, 0.001);
          } else {
            kon(ch, key, vel);
          }
          break;
        default:
          break;
      }
    }

    function kon(ch, key, vel) {
      checkboxes[ch].setAttribute("checked", true);
      meters[ch * 2].value = key;
      meters[ch * 2 + 1].value = vel;
      programs[ch].frequency.linearRampToValueAtTime(
        Math.pow(2, (key - 69) / 12) * 440,
        0.01
      );
      gains[ch].gain.linearRampToValueAtTime(
        (vel * vel * ccs[ch * 16 + 7] * ccs[ch * 16 + 11] * one_over_128x4) / 4,
        0.02
      );
      gains[ch].gain.setTargetAtTime(
        (0.5 * ccs[ch * 16 + 7]) / 128 / 2,
        0.5,
        0.5
      );
    }
  };
};
