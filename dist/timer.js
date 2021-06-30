"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playPauseTimer = void 0;
let worker;
const timespan = document.querySelector("span#time");
const buttons = Array.from(document.querySelectorAll("button"));
function initworker() {
    worker = new Worker(URL.createObjectURL(new Blob([
        /* javascript */ `
  const timer = {
    timeout: 50,
    t: 0,
    paused: false,
  };
  function run(timer) {
    function loop() {
      if (timer.paused == false) {
        timer.t += timer.timeout;
        postMessage(timer.t);
      }
      setTimeout(loop, timer.timeout);
    }
    setTimeout(loop, timer.timeout);
  }
  
  onmessage = function(e){
    switch (e.data) {
      case 'pause':
        timer.paused = true;
        break;
      case 'resume':
        timer.paused = false;
        break;
      default:
        timer.timeout = parseInt(e.data);
        break;
    }
  }
  `,
    ], { type: "application/javascript" })));
    worker.onmessage = ({ data }) => {
        timespan.innerHTML = data;
    };
}
function playPauseTimer() {
    let enablebuttons = (enabledArray) => {
        for (let i = 0; i < 4; i++) {
            if (enabledArray.indexOf(i) >= 0) {
                buttons[i].classList.remove("hidden");
            }
            else {
                buttons[i].classList.add("hidden");
            }
        }
    };
    buttons.map((btn, idx) => {
        switch (idx) {
            case 0:
                btn.onclick = () => {
                    enablebuttons([1, 3]);
                    initworker();
                };
                break;
            case 1:
                btn.onclick = () => {
                    worker.postMessage("pause");
                    enablebuttons([2, 3]);
                };
                break;
            case 2:
                btn.onclick = () => {
                    worker.postMessage("resume");
                    enablebuttons([1, 3]);
                };
                break;
            case 3:
                btn.onclick = () => {
                    worker.terminate();
                    enablebuttons([0]);
                    timespan.innerHTML = "0";
                };
                break;
            default:
                break;
        }
    });
    enablebuttons([0]);
}
exports.playPauseTimer = playPauseTimer;
