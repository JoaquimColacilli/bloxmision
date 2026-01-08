import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

/**
 * Auto-slicer por transparencia (alpha):
 * - Detecta "bloques" por proyección (columnas/filas con pixeles no transparentes)
 * - Crea bboxes por intersección de segmentos X/Y
 * - Exporta cada sprite como PNG independiente
 *
 * Uso:
 *   node scripts/slice-jorc-actions.mjs input.png outDir [outputSize]
 *
 * Ej:
 *   node scripts/slice-jorc-actions.mjs JORC_ACTION_SPRITES.png public/sprites/jorc_actions 128
 */

const input = process.argv[2] || "JORC_ACTION_SPRITES.png"
const outDir = process.argv[3] || "public/sprites/jorc_actions"
const outputSize = Number(process.argv[4] || 128) // 64 o 128 suelen ir perfecto

fs.mkdirSync(outDir, { recursive: true })

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const width = info.width
const height = info.height

if (!width || !height) throw new Error("No pude leer width/height del PNG.")

console.log(`Input: ${width}x${height}`)
console.log(`Output dir: ${outDir}`)
console.log(`Output size: ${outputSize}x${outputSize}\n`)

const alphaAt = (x, y) => data[(y * width + x) * 4 + 3] // A channel

// 1) Proyección X: columnas con algún pixel no transparente
const colHas = new Array(width).fill(false)
for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
        if (alphaAt(x, y) > 0) {
            colHas[x] = true
            break
        }
    }
}

// 2) Proyección Y: filas con algún pixel no transparente
const rowHas = new Array(height).fill(false)
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        if (alphaAt(x, y) > 0) {
            rowHas[y] = true
            break
        }
    }
}

function segmentsFromBooleans(arr) {
    const segs = []
    let i = 0
    while (i < arr.length) {
        while (i < arr.length && !arr[i]) i++
        if (i >= arr.length) break
        const start = i
        while (i < arr.length && arr[i]) i++
        const end = i - 1
        segs.push({ start, end })
    }
    return segs
}

const xSegs = segmentsFromBooleans(colHas)
const ySegs = segmentsFromBooleans(rowHas)

if (xSegs.length === 0 || ySegs.length === 0) {
    throw new Error("No encontré pixeles no transparentes. ¿El PNG tiene alpha?")
}

console.log(`Detecté ${xSegs.length} segmentos X y ${ySegs.length} segmentos Y.`)

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v))
}

function bboxHasAnyPixel(x0, x1, y0, y1) {
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (alphaAt(x, y) > 0) return true
        }
    }
    return false
}

function tightBBoxInRegion(x0, x1, y0, y1) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (alphaAt(x, y) > 0) {
                if (x < minX) minX = x
                if (y < minY) minY = y
                if (x > maxX) maxX = x
                if (y > maxY) maxY = y
            }
        }
    }
    if (minX === Infinity) return null
    return { minX, minY, maxX, maxY }
}

// 3) Intersección X/Y -> bboxes candidatos
const pad = 2 // mini padding por si algún pixel queda al borde
const sprites = []

for (const ys of ySegs) {
    for (const xs of xSegs) {
        if (!bboxHasAnyPixel(xs.start, xs.end, ys.start, ys.end)) continue

        const tight = tightBBoxInRegion(xs.start, xs.end, ys.start, ys.end)
        if (!tight) continue

        const left = clamp(tight.minX - pad, 0, width - 1)
        const top = clamp(tight.minY - pad, 0, height - 1)
        const right = clamp(tight.maxX + pad, 0, width - 1)
        const bottom = clamp(tight.maxY + pad, 0, height - 1)

        const w = right - left + 1
        const h = bottom - top + 1

        sprites.push({ left, top, width: w, height: h })
    }
}

if (sprites.length === 0) throw new Error("No detecté sprites para exportar.")

console.log(`Detecté ${sprites.length} sprites.\n`)

// 4) Export: cada sprite -> cuadrado outputSize, pixel art (nearest)
let n = 1
for (const s of sprites) {
    const filename = `action-${String(n).padStart(2, "0")}.png`
    const outPath = path.join(outDir, filename)

    await sharp(input)
        .extract(s)
        .resize(outputSize, outputSize, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            kernel: sharp.kernel.nearest,
        })
        .png()
        .toFile(outPath)

    console.log(`✓ ${filename}  (crop ${s.width}x${s.height} @ ${s.left},${s.top})`)
    n++
}

console.log(`\nDone! Generé ${sprites.length} sprites en: ${outDir}/`)