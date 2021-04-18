import { readMidi } from "../src/index";
export function fetchXML(url, target) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    xhr.responseXML &&
      xhr.responseXML.documentElement
        .querySelectorAll("Url")
        .forEach((elem) =>
          target.appendChild(
            new Option(elem.textContent.split("/").pop(), elem.textContent)
          )
        );
  };
  xhr.open("GET", url);
  xhr.responseType = "document";
  xhr.send();
}
export async function canvasR(url) {
  const rr = readMidi(
    new Uint8Array(await (await fetch(url)).arrayBuffer()),
    msgHandler
  );
  const g = document.createElement("main");
  g.innerHTML = render(rr);

  document.body.appendChild(g);

  function msgHandler(cmd, obj, time) {
    switch (cmd) {
      case "header":
        const { division, ntracks, format } = obj;
        rxs[0].innerHTML = ``;
        break;
      case "tempo":
        rxs[1].innerHTML = `${obj.tempo}`;
        break;
      case "noteOn":
        canvasCCs[obj.channel].keyOn(obj);
        break;
      case "noteOff":
        canvasCCs[obj.channel].keyOff(obj);
        break;
      case "cc":
        break;
      default:
        break;
    }
    console.innerHTML = `
${obj.channel}	${cmd}	${JSON.stringify(obj)}${console.innerHTML.substring(
      0,
      102
    )}`;
  }
  const [start, stop, ff, next] = Array.from(
    g.querySelectorAll<HTMLButtonElement>("button")
  );
  const console = g.querySelector("pre");
  const rxs = g.querySelectorAll(".rx");
  await new Promise((r) => (start.onclick = r));

  g.parentElement.style["margin-top"] = "10px";
  const r = readMidi(
    new Uint8Array(await (await fetch(url)).arrayBuffer()),
    msgHandler
  );
  const canvasCCs = r.tracks.map((t, ch) => getCanvas(ch, g));

  function getCanvas(channel, container) {
    const cells = 1 * 88;
    const gridw = 1024 / 88;
    const gridh = 1024 / 16;
    const canvas = document.createElement("canvas");
    const ctgx = canvas.getContext("2d");
    canvas.style.transform = `translate(0,${(channel * 800) / 12})`;
    const height = 800 / 12 - 30;
    const width = 578;
    canvas.setAttribute("width", "1024");
    canvas.setAttribute("height", "1024");
    ctgx.lineWidth = 1;
    ctgx.strokeStyle = "grey";
    ctgx.clearRect(0, 0, width, height);
    ctgx.fillRect(0, 0, width, height);
    container.append(canvas);
    return {
      keyOn: (obj) => {
        ctgx.clearRect(obj.note * gridw, gridh, gridw, gridh);
        ctgx.fillStyle = "black";
        ctgx.rect(obj.note * gridw, obj.channel * gridh, gridw, gridh);
        ctgx.stroke();
        ctgx.fill();
      },
      keyOff: (obj) => {
        ctgx.clearRect(obj.note * gridw, obj.channel * gridh, gridw, gridh);
        ctgx.fillStyle = "black";
        ctgx.rect(obj.note * gridw, obj.channel * gridh, gridw, gridh);
        ctgx.stroke();
        ctgx.fill();
      },
      setText: (text) => {
        ctgx.fillStyle = "black";
        ctgx.clearRect(0, 0, 55, 20);
        ctgx.fillRect(0, 0, 55, 20);
        ctgx.strokeStyle = "yellow";
        ctgx.strokeText(text, 10, 20, 55); //`time: ${time / midid.ticksPerSecond}`, 10, 20, 55);
      },
    };
  }

  function render(state) {
    const { time, tempo, total, timeSig } = state;

    return `<table id="mocha">
      <tr>
        <td>
          <span class="rx">{time}</span>
          <span class="rx">{tempo}</span>
          <button>start</button><button>stop</button><button>rw</button>
          <span class="rx">{total}</span>
          <span class="rx">{timeSig}</span>
        </td>
        <td></td>
        <td><pre> style="max-height: 200px; overflow-y: scroll"></pre></td>
      </tr>
    </table>`;
  }
}
