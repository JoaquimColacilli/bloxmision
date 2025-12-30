import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Usage:
// node slice-ranks-auto.mjs LVLS_SPRITES.png public/ranks 128
const input = process.argv[2] || "LVLS_SPRITES.png";
const outDir = process.argv[3] || "public/ranks";
const outputSize = Number(process.argv[4] || 128);

const cols = 5;
const rows = 2;
const pad = 2; // padding to avoid clipping outlines

const rankNames = [
    "grumete",
    "marinero",
    "navegante",
    "timonel",
    "contramaestre",
    "piloto",
    "primer-oficial",
    "capitan",
    "almirante",
    "leyenda-pirata",
];

fs.mkdirSync(outDir, { recursive: true });

function segmentsFromBoolArray(arr) {
    const segs = [];
    let start = null;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] && start === null) start = i;
        if (!arr[i] && start !== null) {
            segs.push([start, i - 1]);
            start = null;
        }
    }
    if (start !== null) segs.push([start, arr.length - 1]);
    return segs;
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function bboxInRegion(alpha, W, x0, x1, y0, y1) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -1,
        maxY = -1;

    for (let y = y0; y <= y1; y++) {
        const rowOff = y * W;
        for (let x = x0; x <= x1; x++) {
            if (alpha[rowOff + x] > 0) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < 0) return null;
    return { minX, minY, maxX, maxY };
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

// extract alpha channel
const alpha = new Uint8Array(W * H);
for (let i = 0, px = 0; px < W * H; px++, i += 4) alpha[px] = data[i + 3];

console.log(`Input: ${W}x${H}`);

// 1) find Y segments with pixels (will include badge rows + text rows)
const rowHas = new Array(H).fill(false);
for (let y = 0; y < H; y++) {
    const off = y * W;
    for (let x = 0; x < W; x++) {
        if (alpha[off + x] > 0) {
            rowHas[y] = true;
            break;
        }
    }
}
const ySegs = segmentsFromBoolArray(rowHas);

// take the 2 tallest segments = badge rows (ignore short segments = text)
const badgeRows = ySegs
    .slice()
    .sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))
    .slice(0, rows)
    .sort((a, b) => a[0] - b[0]); // top to bottom

if (badgeRows.length !== rows) {
    throw new Error(`No pude detectar ${rows} filas de badges. Segs detectados: ${JSON.stringify(ySegs)}`);
}

let idx = 0;

for (let r = 0; r < badgeRows.length; r++) {
    const [y0, y1] = badgeRows[r];

    // 2) find X segments inside this badge row
    const colHas = new Array(W).fill(false);
    for (let x = 0; x < W; x++) {
        for (let y = y0; y <= y1; y++) {
            if (alpha[y * W + x] > 0) {
                colHas[x] = true;
                break;
            }
        }
    }
    const xSegs = segmentsFromBoolArray(colHas)
        .sort((a, b) => a[0] - b[0]);

    if (xSegs.length < cols) {
        throw new Error(`Fila ${r + 1}: esperaba >=${cols} columnas, detecté ${xSegs.length}: ${JSON.stringify(xSegs)}`);
    }

    // if there are extra segments, keep the widest ones then sort by x
    const xSegsFixed = xSegs
        .slice()
        .sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))
        .slice(0, cols)
        .sort((a, b) => a[0] - b[0]);

    for (let c = 0; c < xSegsFixed.length; c++) {
        if (idx >= rankNames.length) break;

        const [x0, x1] = xSegsFixed[c];

        // 3) compute tight bbox (ignores empty space, ignores labels because y-range is badge-only)
        const bb = bboxInRegion(alpha, W, x0, x1, y0, y1);
        if (!bb) continue;

        const left = clamp(bb.minX - pad, 0, W - 1);
        const top = clamp(bb.minY - pad, 0, H - 1);
        const right = clamp(bb.maxX + pad, 0, W - 1);
        const bottom = clamp(bb.maxY + pad, 0, H - 1);

        const width = right - left + 1;
        const height = bottom - top + 1;

        const filename = `${rankNames[idx]}.png`;
        const outPath = path.join(outDir, filename);

        await sharp(input)
            .extract({ left, top, width, height })
            .resize(outputSize, outputSize, {
                kernel: sharp.kernel.nearest,
                fit: "contain",
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toFile(outPath);

        console.log(`✓ ${filename}`);
        idx++;
    }
}

console.log(`\nDone! Generated ${idx} rank icons in ${outDir}/`);