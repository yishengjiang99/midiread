"use strict";
require("fs").writeFileSync(`build/varlen.js`, `
// prettier-ignore
  export const wasmBinary = new Uint8Array([
    ${require("fs").readFileSync("src/varlen.wasm").join(",")}])`);
