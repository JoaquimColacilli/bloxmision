import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Usage: node slice-grid.mjs <input> <outDir> <cellWidth> <cellHeight> <cols> <rows> [padL] [padT] [padR] [padB] [reindex]
// Example: node slice-grid.mjs barco_sprites.jpg public/sprites/boat_raw 256 253 4 2 0 0 0 0 1

const input = process.argv[2];
const outDir = process.argv[3];
const cellWidth = Number(process.argv[4]);
const cellHeight = Number(process.argv[5]);
const cols = Number(process.argv[6]);
const rows = Number(process.argv[7]);
const padL = Number(process.argv[8] || 0);
const padT = Number(process.argv[9] || 0);
const padR = Number(process.argv[10] || 0);
const padB = Number(process.argv[11] || 0);
const reindex = Number(process.argv[12] || 1); // Starting index for output filenames

if (!input || !outDir || !cellWidth || !cellHeight || !cols || !rows) {
    console.error("Usage: node slice-grid.mjs <input> <outDir> <cellWidth> <cellHeight> <cols> <rows> [padL] [padT] [padR] [padB] [reindex]");
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const img = sharp(input);
const meta = await img.metadata();

if (!meta.width || !meta.height) {
    throw new Error("Could not read width/height from image.");
}

console.log(`Input image: ${meta.width}x${meta.height}`);
console.log(`Cell size: ${cellWidth}x${cellHeight}`);
console.log(`Grid: ${cols}x${rows}`);
console.log(`Padding: L=${padL} T=${padT} R=${padR} B=${padB}`);
console.log(`Output directory: ${outDir}`);
console.log("");

let n = reindex;
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        // Calculate position with padding
        const left = padL + c * cellWidth;
        const top = padT + r * cellHeight;

        // Ensure we don't exceed image bounds
        const extractWidth = Math.min(cellWidth - padR, meta.width - left);
        const extractHeight = Math.min(cellHeight - padB, meta.height - top);

        if (extractWidth <= 0 || extractHeight <= 0) {
            console.warn(`Skipping cell ${c},${r} - out of bounds`);
            continue;
        }

        const filename = `frame-${String(n).padStart(2, "0")}.png`;
        const outPath = path.join(outDir, filename);

        await sharp(input)
            .extract({ left, top, width: cellWidth, height: cellHeight })
            .png()
            .toFile(outPath);

        console.log(`Generated: ${filename} (from ${left},${top})`);
        n++;
    }
}

console.log(`\nDone! Generated ${n - reindex} frames in: ${outDir}`);
