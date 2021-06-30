"use strict";
exports.__esModule = true;
exports.playPauseTimer = void 0;
var worker;
var timespan = document.querySelector('span#time');
var buttons = Array.from(document.querySelectorAll('button'));
function initworker() {
    worker = new Worker(URL.createObjectURL(new Blob([
        /* javascript */ "\n  const timer = {\n    timeout: 50,\n    t: 0,\n    paused: false,\n  };\n  function run(timer) {\n    function loop() {\n      if (timer.paused == false) {\n        timer.t += timer.timeout;\n        postMessage(timer.t);\n      }\n      setTimeout(loop, timer.timeout);\n    }\n    setTimeout(loop, timer.timeout);\n  }\n  run(timer);\n  \n  onmessage = function(e){\n    switch (e.data) {\n      case 'pause':\n        timer.paused = true;\n        break;\n      case 'resume':\n        timer.paused = false;\n        break;\n      default:\n        timer.timeout = parseInt(e.data);\n        break;\n    }\n  }\n  ",
    ], { type: 'application/javascript' })));
    worker.onmessage = function (_a) {
        var data = _a.data;
        timespan.innerHTML = data;
    };
}
function playPauseTimer() {
    var enablebuttons = function (enabledArray) {
        for (var i = 0; i < 4; i++) {
            if (enabledArray.indexOf(i) >= 0) {
                buttons[i].classList.remove('hidden');
            }
            else {
                buttons[i].classList.add('hidden');
            }
        }
    };
    buttons.map(function (btn, idx) {
        switch (idx) {
            case 0:
                btn.onclick = function () {
                    enablebuttons([1, 3]);
                    initworker();
                };
                break;
            case 1:
                btn.onclick = function () {
                    worker.postMessage('pause');
                    enablebuttons([2, 3]);
                };
                break;
            case 2:
                btn.onclick = function () {
                    worker.postMessage('resume');
                    enablebuttons([1, 3]);
                };
                break;
            case 3:
                btn.onclick = function () {
                    worker.terminate();
                    enablebuttons([0]);
                    timespan.innerHTML = '0';
                };
                break;
            default:
                break;
        }
    });
    enablebuttons([0]);
}
exports.playPauseTimer = playPauseTimer;
