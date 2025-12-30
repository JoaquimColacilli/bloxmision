// scripts/slice-islands.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Usage:
// node scripts/slice-islands.mjs <input.png> <outDir> [outSize]
// Example:
// node scripts/slice-islands.mjs public/LOGOS_ISLANDS_SPRITES.png public/islands 128

const input = process.argv[2] || "public/LOGOS_ISLANDS_SPRITES.png";
const outDir = process.argv[3] || "public/islands";
const outSize = Number(process.argv[4] || 128);

const cols = 5;
const rows = 2;

// Nombres (1..5). Ajustalos a tus nombres reales si querés.
const islandNames = ["secuencia", "bucle", "decision", "memoria", "funcion"];

fs.mkdirSync(outDir, { recursive: true });

const meta = await sharp(input).metadata();

if (!meta.width || !meta.height) throw new Error("No pude leer width/height del PNG.");

// Use floor to avoid going out of bounds
const tileW = Math.floor(meta.width / cols);
const tileH = Math.floor(meta.height / rows);

console.log(`Input: ${meta.width}x${meta.height}`);
console.log(`Grid: ${cols}x${rows}`);
console.log(`Tile: ${tileW}x${tileH}`);
console.log(`Output size: ${outSize}x${outSize}\n`);

// Slice directly from input
for (let c = 0; c < cols; c++) {
    const name = islandNames[c] ?? `isla-${c + 1}`;

    // Row 0 = unlocked (top)
    {
        const left = c * tileW;
        const top = 0;

        const outPath = path.join(outDir, `${name}.png`);
        await sharp(input)
            .extract({ left, top, width: tileW, height: tileH })
            .resize(outSize, outSize, { kernel: sharp.kernel.nearest })
            .png()
            .toFile(outPath);

        console.log(`✓ ${name}.png (unlocked)`);
    }

    // Row 1 = locked (bottom)
    {
        const left = c * tileW;
        const top = tileH;

        const outPath = path.join(outDir, `${name}-locked.png`);
        await sharp(input)
            .extract({ left, top, width: tileW, height: tileH })
            .resize(outSize, outSize, { kernel: sharp.kernel.nearest })
            .png()
            .toFile(outPath);

        console.log(`✓ ${name}-locked.png (locked)`);
    }
}

console.log(`\nDone! Generated ${cols * 2} icons in: ${outDir}/`);
