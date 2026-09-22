import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import sharp from "sharp";

async function svgToPng(svgPath, pngPath, width) {
  const svg = await readFile(svgPath);
  await sharp(svg, { density: 144 })
    .resize({ width, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log("Wrote", pngPath);
}

const root = process.cwd();

await svgToPng(
  resolve(root, "assets/header.svg"),
  resolve(root, "assets/header.png"),
  1200,
);

const pinDir = resolve(root, "assets/pins");
const pinFiles = (await readdir(pinDir)).filter((name) => name.endsWith(".svg"));
for (const name of pinFiles) {
  const base = name.replace(/\.svg$/, "");
  const pngName =
    base === "multi-tenant-rag-chatbot" ? `${base}-card.png` : `${base}.png`;
  await svgToPng(resolve(pinDir, name), resolve(pinDir, pngName), 830);
}
