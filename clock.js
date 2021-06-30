var timer = {
    timeout: 50,
    t: 0,
    paused: false
};
function msg(timer, msg) {
    switch (msg) {
        case 'pause':
            timer.paused = true;
            break;
        case 'resume':
            timer.paused = false;
            break;
        default:
            timer.timeout = parseInt(msg);
            break;
    }
}
function run(timer) {
    function loop() {
        if (timer.paused == false) {
            timer.t += timer.timeout;
            // @ts-ignore
            postMessage({ time: timer.t });
        }
        setTimeout(loop, timer.timeout);
    }
    setTimeout(loop, timer.timeout);
}
run(timer);
onmessage = function (e) { return msg(timer, e.data); };
