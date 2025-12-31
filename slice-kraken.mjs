// slice-kraken.mjs
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

// Usage:
// node slice-kraken.mjs KRAKEN_SPRITES.png public/sprites/kraken 64

const input = process.argv[2] || "KRAKEN_SPRITES.png"
const outDir = process.argv[3] || "public/sprites/kraken"
const outSize = Number(process.argv[4] || 64)

// The sprite sheet is 3 columns x 2 rows (5 krakens total, one cell empty)
const cols = 3
const rows = 2

// Frame positions and names (row, col)
const frames = [
    { name: "idle", row: 0, col: 0 },
    { name: "attack-up", row: 0, col: 1 },
    { name: "attack-right", row: 0, col: 2 },
    { name: "attack-down", row: 1, col: 0 },
    { name: "attack-left", row: 1, col: 1 },
]

fs.mkdirSync(outDir, { recursive: true })

const image = sharp(input)
const meta = await image.metadata()

if (!meta.width || !meta.height) throw new Error("No pude leer width/height del PNG.")

console.log(`Input: ${meta.width}x${meta.height}`)

// Calculate tile size (approximate, round to nearest)
const tileW = Math.floor(meta.width / cols)
const tileH = Math.floor(meta.height / rows)

console.log(`Tile: ${tileW}x${tileH}`)
console.log(`Output: ${outSize}x${outSize}\n`)

for (const frame of frames) {
    const left = frame.col * tileW
    const top = frame.row * tileH
    const outPath = path.join(outDir, `${frame.name}.png`)

    await sharp(input)
        .extract({ left, top, width: tileW, height: tileH })
        .resize(outSize, outSize, { kernel: sharp.kernel.nearest })
        .png()
        .toFile(outPath)

    console.log(`✓ ${frame.name}.png`)
}

console.log(`\nDone! Exportado en: ${outDir}/`)
