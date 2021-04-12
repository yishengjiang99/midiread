import { bufferReader } from "../dist/bufread.js";
const expect = chai.expect;
const cscale = new Uint8Array([
  //source:
  0x4d,
  0x54,
  0x68,
  0x64,
  0x00,
  0x00,
  0x00,
  0x06 /* 0x00    */,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x06,
  0x4d,
  0x54 /* 0x08    */,
  0x72,
  0x6b,
  0x00,
  0x00,
  0x02,
  0x63,
  0x00,
  0xb0 /* 0x10    */,
  0x00,
  0x00,
  0x00,
  0xc0,
  0x00,
  0x00,
  0x93,
  0x83 /* 0x18  C */,
  0x64,
  0x08,
  0x81,
  0x00,
  0x00,
  0x08,
  0x93,
  0x82 /* 0x20  D */,
  0x64,
  0x08,
  0x83,
  0x02,
  0x00,
  0x08,
  0x93,
  0x04 /* 0x28  E */,
  0x64,
  0x08,
  0x83,
  0x04,
  0x00,
  0x08,
  0x93,
  0x05 /* 0x30  F */,
  0x64,
  0x08,
  0x83,
  0x05,
  0x00,
  0x08,
  0x93,
  0x07 /* 0x38  G */,
  0x64,
  0x08,
  0x83,
  0x07,
  0x00,
  0x08,
  0x93,
  0x09 /* 0x40  A */,
  0x64,
  0x08,
  0x83,
  0x09,
  0x00,
  0x08,
  0x93,
  0x0b /* 0x48  B */,
  0x64,
  0x08,
  0x83,
  0x0b,
  0x00,
  0x08,
  0x93,
  0x0c /* 0x50  C */,
  0x64,
  0x08,
  0x83,
  0x0c,
  0x00,
  0x08,
  0x93,
  0x0e /* 0x58  D */,
  0x64,
  0x08,
  0x83,
  0x0e,
  0x00,
  0x08,
  0x93,
  0x10 /* 0x60  E */,
  0x64,
  0x08,
  0x83,
  0x10,
  0x00,
  0x08,
  0x93,
  0x11 /* 0x68  F */,
  0x64,
  0x08,
  0x83,
  0x11,
  0x00,
  0x08,
  0x93,
  0x13 /* 0x70  G */,
  0x64,
  0x08,
  0x83,
  0x13,
  0x00,
  0x08,
  0x93,
  0x15 /* 0x78  A */,
  0x64,
  0x08,
  0x83,
  0x15,
  0x00,
  0x08,
  0x93,
  0x17 /* 0x83  B */,
  0x64,
  0x08,
  0x83,
  0x17,
  0x00,
  0x08,
  0x93,
  0x18 /* 0x88  C */,
  0x64,
  0x08,
  0x83,
  0x18,
  0x00,
  0x08,
  0x93,
  0x1a /* 0x93  D */,
  0x64,
  0x08,
  0x83,
  0x1a,
  0x00,
  0x08,
  0x93,
  0x1c /* 0x98  E */,
  0x64,
  0x08,
  0x83,
  0x1c,
  0x00,
  0x08,
  0x93,
  0x1d /* 0xA0  F */,
  0x64,
  0x08,
  0x83,
  0x1d,
  0x00,
  0x08,
  0x93,
  0x1f /* 0xA8  G */,
  0x64,
  0x08,
  0x83,
  0x1f,
  0x00,
  0x08,
  0x93,
  0x21 /* 0xB0  A */,
  0x64,
  0x08,
  0x83,
  0x21,
  0x00,
  0x08,
  0x93,
  0x23 /* 0xB8  B */,
  0x64,
  0x08,
  0x83,
  0x23,
  0x00,
  0x08,
  0x93,
  0x24 /* 0xC0  C */,
  0x64,
  0x08,
  0x83,
  0x24,
  0x00,
  0x08,
  0x93,
  0x26 /* 0xC8  D */,
  0x64,
  0x08,
  0x83,
  0x26,
  0x00,
  0x08,
  0x93,
  0x28 /* 0xD0  E */,
  0x64,
  0x08,
  0x83,
  0x28,
  0x00,
  0x08,
  0x93,
  0x29 /* 0xD8  F */,
  0x64,
  0x08,
  0x83,
  0x29,
  0x00,
  0x08,
  0x93,
  0x2b /* 0xE0  G */,
  0x64,
  0x08,
  0x83,
  0x2b,
  0x00,
  0x08,
  0x93,
  0x2d /* 0xE8  A */,
  0x64,
  0x08,
  0x83,
  0x2d,
  0x00,
  0x08,
  0x93,
  0x2f /* 0xF0  B */,
  0x64,
  0x08,
  0x83,
  0x2f,
  0x00,
  0x08,
  0x93,
  0x30 /* 0xF8  C */,
  0x64,
  0x08,
  0x83,
  0x30,
  0x00,
  0x08,
  0x93,
  0x32 /* 0x100 D */,
  0x64,
  0x08,
  0x83,
  0x32,
  0x00,
  0x08,
  0x93,
  0x34 /* 0x108 E */,
  0x64,
  0x08,
  0x83,
  0x34,
  0x00,
  0x08,
  0x93,
  0x35 /* 0x110 F */,
  0x64,
  0x08,
  0x83,
  0x35,
  0x00,
  0x08,
  0x93,
  0x37 /* 0x118 G */,
  0x64,
  0x08,
  0x83,
  0x37,
  0x00,
  0x08,
  0x93,
  0x39 /* 0x120 A */,
  0x64,
  0x08,
  0x83,
  0x39,
  0x00,
  0x08,
  0x93,
  0x3b /* 0X128 B */,
  0x64,
  0x08,
  0x83,
  0x3b,
  0x00,
  0x08,
  0x93,
  0x3c /* 0x130 C */,
  0x64,
  0x08,
  0x83,
  0x3c,
  0x00,
  0x08,
  0x93,
  0x3e /* 0x138 D */,
  0x64,
  0x08,
  0x83,
  0x3e,
  0x00,
  0x08,
  0x93,
  0x40 /* 0X140 E */,
  0x64,
  0x08,
  0x83,
  0x40,
  0x00,
  0x08,
  0x93,
  0x41 /* 0x148 F */,
  0x64,
  0x08,
  0x83,
  0x41,
  0x00,
  0x08,
  0x93,
  0x43 /* 0x150 G */,
  0x64,
  0x08,
  0x83,
  0x43,
  0x00,
  0x08,
  0x93,
  0x45 /* 0x158 A */,
  0x64,
  0x08,
  0x83,
  0x45,
  0x00,
  0x08,
  0x93,
  0x47 /* 0x160 B */,
  0x64,
  0x08,
  0x83,
  0x47,
  0x00,
  0x08,
  0x93,
  0x48 /* 0x168 C */,
  0x64,
  0x08,
  0x83,
  0x48,
  0x00,
  0x08,
  0x93,
  0x4a /* 0x170 D */,
  0x64,
  0x08,
  0x83,
  0x4a,
  0x00,
  0x08,
  0x93,
  0x4c /* 0x178 E */,
  0x64,
  0x08,
  0x83,
  0x4c,
  0x00,
  0x08,
  0x93,
  0x4d /* 0x180 F */,
  0x64,
  0x08,
  0x83,
  0x4d,
  0x00,
  0x08,
  0x93,
  0x4f /* 0x188 G */,
  0x64,
  0x08,
  0x83,
  0x4f,
  0x00,
  0x08,
  0x93,
  0x51 /* 0x190 A */,
  0x64,
  0x08,
  0x83,
  0x51,
  0x00,
  0x08,
  0x93,
  0x53 /* 0x198 B */,
  0x64,
  0x08,
  0x83,
  0x53,
  0x00,
  0x08,
  0x93,
  0x54 /* 0x1A0 C */,
  0x64,
  0x08,
  0x83,
  0x54,
  0x00,
  0x08,
  0x93,
  0x56 /* 0x1A8 D */,
  0x64,
  0x08,
  0x83,
  0x56,
  0x00,
  0x08,
  0x93,
  0x58 /* 0x1B0 E */,
  0x64,
  0x08,
  0x83,
  0x58,
  0x00,
  0x08,
  0x93,
  0x59 /* 0x1B8 F */,
  0x64,
  0x08,
  0x83,
  0x59,
  0x00,
  0x08,
  0x93,
  0x5b /* 0x1C0 G */,
  0x64,
  0x08,
  0x83,
  0x5b,
  0x00,
  0x08,
  0x93,
  0x5d /* 0x1C8 A */,
  0x64,
  0x08,
  0x83,
  0x5d,
  0x00,
  0x08,
  0x93,
  0x5f /* 0x1D0 B */,
  0x64,
  0x08,
  0x83,
  0x5f,
  0x00,
  0x08,
  0x93,
  0x60 /* 0x1D8 C */,
  0x64,
  0x08,
  0x83,
  0x60,
  0x00,
  0x08,
  0x93,
  0x62 /* 0x1E0 D */,
  0x64,
  0x08,
  0x83,
  0x62,
  0x00,
  0x08,
  0x93,
  0x64 /* 0x1E8 E */,
  0x64,
  0x08,
  0x83,
  0x64,
  0x00,
  0x08,
  0x93,
  0x65 /* 0x1F0 F */,
  0x64,
  0x08,
  0x83,
  0x65,
  0x00,
  0x08,
  0x93,
  0x67 /* 0x1F8 G */,
  0x64,
  0x08,
  0x83,
  0x67,
  0x00,
  0x08,
  0x93,
  0x69 /* 0x200 A */,
  0x64,
  0x08,
  0x83,
  0x69,
  0x00,
  0x08,
  0x93,
  0x6b /* 0x208 B */,
  0x64,
  0x08,
  0x83,
  0x6b,
  0x00,
  0x08,
  0x93,
  0x6c /* 0x210 C */,
  0x64,
  0x08,
  0x83,
  0x6c,
  0x00,
  0x08,
  0x93,
  0x6e /* 0x218 D */,
  0x64,
  0x08,
  0x83,
  0x6e,
  0x00,
  0x08,
  0x93,
  0x70 /* 0x220 E */,
  0x64,
  0x08,
  0x83,
  0x70,
  0x00,
  0x08,
  0x93,
  0x71 /* 0x228 F */,
  0x64,
  0x08,
  0x83,
  0x71,
  0x00,
  0x08,
  0x93,
  0x73 /* 0x230 G */,
  0x64,
  0x08,
  0x83,
  0x73,
  0x00,
  0x08,
  0x93,
  0x75 /* 0x238 A */,
  0x64,
  0x08,
  0x83,
  0x75,
  0x00,
  0x08,
  0x93,
  0x77 /* 0x240 B */,
  0x64,
  0x08,
  0x83,
  0x77,
  0x00,
  0x08,
  0x93,
  0x78 /* 0x248 C */,
  0x64,
  0x08,
  0x83,
  0x78,
  0x00,
  0x08,
  0x93,
  0x7a /* 0x250 D */,
  0x64,
  0x08,
  0x83,
  0x7a,
  0x00,
  0x08,
  0x93,
  0x7c /* 0x258 E */,
  0x64,
  0x08,
  0x83,
  0x7c,
  0x00,
  0x08,
  0x93,
  0x7d /* 0x260 F */,
  0x64,
  0x08,
  0x83,
  0x7d,
  0x00,
  0x08,
  0x93,
  0x7f /* 0x268 G */,
  0x64,
  0x08,
  0x83,
  0x7f,
  0x00,
  0x08,
  0xff,
  0x2f /* 0x270   */,
  0x00 /* 0x278   */,
]);

describe("bufread", () => {
  it("reads midi", () => {
    const r = bufferReader(cscale);
    expect(String.fromCharCode(r.fgetc())).to.eq("M");
    expect(r.offset).to.eq(1);
  });
});
