import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'bao-001.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'sliced');

const startX = 0;
const startY = 30;
const cropWidth = 410;
const cropHeight = 210;
const itemCount = 10;

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const image = await loadImage(INPUT_PATH);

  for (let i = 0; i < itemCount; i++) {
    const sy = startY + i * cropHeight;

    // اگر به انتهای تصویر رسیدیم، ادامه نده
    if (sy + cropHeight > image.height || startX + cropWidth > image.width) break;

    const canvas = createCanvas(cropWidth, cropHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, startX, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `bao001-${String(i + 1).padStart(3, '0')}.png`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Created: ${outputFileName}`);
  }
})().catch(err => {
  console.error('❌ Slice error:', err);
  process.exit(1);
});
