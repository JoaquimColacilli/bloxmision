import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const input = process.argv[2] || "treasure-map.png";
const outDir = process.argv[3] || "public/fragments";
const outSize = Number(process.argv[4] || 200); // Larger size for better quality
const cols = 5;
const rows = 3;

fs.mkdirSync(outDir, { recursive: true });

const img = sharp(input);
const meta = await img.metadata();

if (!meta.width || !meta.height) throw new Error("No pude leer width/height del PNG.");

console.log(`Imagen: ${meta.width}x${meta.height}`);

// Calculate tile dimensions (may have rounding)
const tileW = Math.floor(meta.width / cols);
const tileH = Math.floor(meta.height / rows);

console.log(`Cada tile: ${tileW}x${tileH}`);

let n = 1;
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const left = c * tileW;
        const top = r * tileH;

        const filename = `fragment-${n}.png`;
        const outPath = path.join(outDir, filename);

        let tile = sharp(input).extract({ left, top, width: tileW, height: tileH });

        // Resize to output size, maintaining aspect ratio
        tile = tile.resize(outSize, outSize, { fit: "cover" });

        await tile.png().toFile(outPath);
        console.log(`Generado: ${filename}`);
        n++;
    }
}

console.log(`\nListo! Generé 15 fragmentos en: ${outDir}`);
