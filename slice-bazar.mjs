import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * slice-bazar.mjs
 * Slicer específico para BAZAR_SPRITES.png (548x455)
 *
 * Layout detectado:
 * - 6 cols
 * - cada celda: 91px de ancho
 * - padding izquierda: 1px (padL)
 * - filas de íconos (sin capturar las barras de texto):
 *   skins: top=0   height=90
 *   pets:  top=103 height=79
 *   acc:   top=196 height=75
 *   weap:  top=286 height=77
 *   fx:    top=379 height=60   (ajustado para NO agarrar texto al pie)
 *
 * Salida:
 * outDir/<categoria>/<id>.png
 * outDir/manifest.json
 */

const input = process.argv[2];
const outDir = process.argv[3];
const outSize = Number(process.argv[4] ?? 64); // 0 => no square/pad

if (!input || !outDir) {
    console.error("Usage: node slice-bazar.mjs <input> <outDir> [outSize]");
    console.error("Example: node slice-bazar.mjs BAZAR_SPRITES.png public/sprites/bazar 64");
    process.exit(1);
}

const COLS = 6;
const CELL_W = 91;
const PAD_L = 1;

const ROWS = [
    {
        key: "skins",
        top: 0,
        height: 75,
        ids: [
            "jorc-clasico",
            "jorc-marinero",
            "jorc-capitan",
            "jorc-pirata-legendario",
            "jorc-fantasma",
            "jorc-dorado",
        ],
    },
    {
        key: "pets",
        top: 103,
        height: 68,
        ids: ["loro-verde", "mono-travieso", "cangrejo-ermitano", "pulpo-magico", "dragon-marino", "rayita"],
    },
    {
        key: "accesorios",
        top: 196,
        height: 62,
        ids: [
            "barba-del-capitan",
            "parche-en-el-ojo",
            "bandana-roja",
            "arete-de-oro-epico",
            "corona-dorada",
            "emblema-pirata",
        ],
    },
    {
        key: "armas",
        top: 278,
        height: 62,
        ids: ["espada-de-madera", "sable-pirata", "catalejo", "espada-legendaria", "mata-krakens", "brujula"],
    },
    {
        key: "efectos",
        top: 379,
        height: 42,
        ids: ["estela-de-burbujas", "chispas-doradas", "rastro-de-estrellas", "efecto-llama", "efecto-brillo", "jorcoin"],
    },
];

await fs.mkdir(outDir, { recursive: true });

const meta = await sharp(input).metadata();
console.log(`Input: ${meta.width}x${meta.height}`);
console.log(`CellW: ${CELL_W} | padL: ${PAD_L} | cols: ${COLS}`);
console.log(`outDir: ${outDir} | outSize: ${outSize}`);
console.log("");

const items = [];

for (let r = 0; r < ROWS.length; r++) {
    const row = ROWS[r];
    const rowDir = path.join(outDir, row.key);
    await fs.mkdir(rowDir, { recursive: true });

    if (row.ids.length !== COLS) {
        throw new Error(`Row "${row.key}" debe tener ${COLS} ids (tiene ${row.ids.length}).`);
    }

    for (let c = 0; c < COLS; c++) {
        const id = row.ids[c];

        const left = PAD_L + c * CELL_W;
        const top = row.top;

        if (left + CELL_W > meta.width || top + row.height > meta.height) {
            console.warn(`Skipping ${row.key}/${id}: out of bounds (${left},${top})`);
            continue;
        }

        let pipeline = sharp(input)
            .extract({ left, top, width: CELL_W, height: row.height })
            .trim(); // trim por transparencia

        // Si querés íconos cuadrados para UI:
        if (outSize > 0) {
            pipeline = pipeline.resize(outSize, outSize, {
                fit: "contain",
                kernel: sharp.kernel.nearest, // pixel-art friendly
                background: { r: 0, g: 0, b: 0, alpha: 0 },
                withoutEnlargement: true,
            });
        }

        const outPath = path.join(rowDir, `${id}.png`);
        await pipeline.png().toFile(outPath);

        const rel = `${row.key}/${id}.png`;
        items.push({ id, category: row.key, file: rel, col: c, row: r });

        console.log(`✓ ${rel}`);
    }
}

const manifest = {
    input: path.basename(input),
    image: { width: meta.width, height: meta.height },
    grid: { cols: COLS, cellWidth: CELL_W, padLeft: PAD_L },
    rows: ROWS.map((r) => ({ category: r.key, top: r.top, height: r.height })),
    outSize,
    items,
};

await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(`\nDone! Generated ${items.length} sprites in: ${outDir}`);
