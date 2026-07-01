import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const standardFontDataUrl = path.join(projectRoot, 'node_modules/pdfjs-dist/standard_fonts/');

const comics = [
  'candi-jawi',
  'candi-penataran',
  'gajah-mungkur',
  'jembatan-merah',
  'keraton-sumenep',
];

async function generateCover(slug) {
  const comicDir = path.join(projectRoot, 'public/comics', slug);
  const pdfPath = path.join(comicDir, `${slug}.pdf`);
  const outputPath = path.join(comicDir, 'cover.webp');
  const data = new Uint8Array(await readFile(pdfPath));
  const loadingTask = getDocument({
    data,
    disableWorker: true,
    standardFontDataUrl,
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = 900 / baseViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const canvasContext = canvas.getContext('2d');

  canvasContext.fillStyle = '#ffffff';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext, viewport }).promise;
  await mkdir(comicDir, { recursive: true });
  await writeFile(outputPath, canvas.toBuffer('image/webp', 84));

  await pdf.cleanup();
  await loadingTask.destroy();
  return outputPath;
}

for (const slug of comics) {
  const outputPath = await generateCover(slug);
  console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
}
