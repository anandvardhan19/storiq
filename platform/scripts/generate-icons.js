// Generates solid-color PNG icons for PWA manifest (pure Node, no deps)
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const lenB = Buffer.allocUnsafe(4);
  lenB.writeUInt32BE(data.length);
  const crcVal = crc32(Buffer.concat([typeB, data]));
  const crcB = Buffer.allocUnsafe(4);
  crcB.writeUInt32BE(crcVal);
  return Buffer.concat([lenB, typeB, data, crcB]);
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(2, 9);   // color type: RGB
  ihdr.writeUInt8(0, 10);  // compression
  ihdr.writeUInt8(0, 11);  // filter
  ihdr.writeUInt8(0, 12);  // interlace

  // one scanline = filter byte + RGB * width
  const scanline = Buffer.allocUnsafe(1 + size * 3);
  scanline[0] = 0; // None filter
  for (let x = 0; x < size; x++) {
    scanline[1 + x * 3] = r;
    scanline[2 + x * 3] = g;
    scanline[3 + x * 3] = b;
  }
  const rows = Buffer.allocUnsafe(scanline.length * size);
  for (let y = 0; y < size; y++) scanline.copy(rows, y * scanline.length);
  const idat = zlib.deflateSync(rows);

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const out = path.join(__dirname, '../public');
fs.mkdirSync(out, { recursive: true });

// Brand purple: #7c3aed = 124, 58, 237
const [r, g, b] = [124, 58, 237];

for (const size of [192, 512]) {
  fs.writeFileSync(path.join(out, `icon-${size}.png`), makePNG(size, r, g, b));
  console.log(`✓ icon-${size}.png`);
}
