import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'bao-001.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'sliced');

// اگر در bao-001.png 10 آیتم داری، بگذار 10؛ اگر 100 تاست، بگذار 100
const itemCount = 100;

// اگر بالای تصویر کمی فضای خالی داری، این را تنظیم کن (به پیکسل واقعی تصویر)
const startY = 0;

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const image = await loadImage(INPUT_PATH);

  const cropWidth = image.width;                       // کل عرض تصویر
  const totalHeight = image.height - startY;
  const baseStep = Math.floor(totalHeight / itemCount);

  for (let i = 0; i < itemCount; i++) {
    const sy = startY + i * baseStep;

    // آخرین تکه را تا انتهای تصویر ببر تا خطای گرد کردن جبران شود
    const thisHeight = (i === itemCount - 1) ? (image.height - sy) : baseStep;
    if (thisHeight <= 0) break;

    const canvas = createCanvas(cropWidth, thisHeight);
    const ctx = canvas.getContext('2d');

    // برای جلوگیری از «درز» بین تکه‌ها می‌توانی 1px هم‌پوشانی بدهی:
    // const overlap = i === 0 ? 0 : 1;
    // ctx.drawImage(image, 0, sy - overlap, cropWidth, thisHeight + overlap, 0, 0, cropWidth, thisHeight + overlap);

    ctx.drawImage(image, 0, sy, cropWidth, thisHeight, 0, 0, cropWidth, thisHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `bao001-${String(i + 1).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outputFileName), buffer);
    console.log(`✅ Created: ${outputFileName}  (y=${sy}, h=${thisHeight})`);
  }
})().catch(err => {
  console.error('❌ Slice error:', err);
  process.exit(1);
});
