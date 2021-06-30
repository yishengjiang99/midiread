export function mkdiv(type, attr = {}, children = "") {
    const div = document.createElement(type);
    for (const key in attr) {
        if (key.match(/on(.*)/)) {
            div.addEventListener(key.match(/on(.*)/)[1], attr[key]);
        }
        else {
            div.setAttribute(key, attr[key]);
        }
    }
    const charray = !Array.isArray(children) ? [children] : children;
    charray.forEach((c) => {
        typeof c == "string" ? (div.innerHTML += c) : div.append(c);
    });
    return div;
}
export function logdiv() {
    const logs = [];
    const errPanel = mkdiv("div");
    const infoPanel = mkdiv("pre", {
        style: "width:30em;min-height:299px;scroll-width:0;max-height:299px;overflow-y:scroll",
    });
    const stderr = (str) => (errPanel.innerHTML = str);
    const stdout = (log) => {
        logs.push((performance.now() / 1e3).toFixed(3) + ": " + log);
        if (logs.length > 100)
            logs.shift();
        infoPanel.innerHTML = logs.join("\n");
        infoPanel.scrollTop = infoPanel.scrollHeight;
    };
    return {
        stderr,
        stdout,
        infoPanel,
        errPanel,
    };
}
export function wrapDiv(div, tag, attrs = {}) {
    return mkdiv(tag, attrs, [div]);
}
export function wrapList(divs) {
    return mkdiv("div", {}, divs);
}
export async function fetchAwaitBuffer(url) {
    return await (await fetch(url)).arrayBuffer();
}
function fetchXML(url, cb) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.responseXML) {
            const ar = xhr.responseXML.documentElement.querySelectorAll("Url");
            cb(Array.from(ar).map((ele) => ele.innerHTML));
        }
    };
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
}
export const cdnhost = "https://grep32bit.blob.core.windows.net/midi";
export const mlist = async () => {
    return new Promise((resolve) => {
        fetchXML(cdnhost + "?resttype=container&comp=list", resolve);
    });
};
export const mk_link = (url, linkclicked) => {
    return mkdiv("a", {
        onclick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            linkclicked(url);
        },
    }, url);
};
export const midipanel = async (container, playMidi) => {
    const midiurls = await new Promise((resolve) => fetchXML(cdnhost + "?resttype=container&comp=list", resolve));
    midiurls.map((url) => {
        container.appendChild(mkdiv("li", {}, mk_link(url, playMidi)));
    });
    return midiurls;
};
