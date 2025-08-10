import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'bao-001.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'sliced');

// ===== تنظیمات (پیکسل واقعی تصویر) =====
const startX_px  = 2;    // شروع برش از لبه چپ (px)
const endX_px    = 400;  // پایان برش (px)
const startY_px  = 2;    // شروع برش از بالا (px)
const itemCount  = 100;  // تعداد آیتم‌ها
// ======================================

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const image = await loadImage(INPUT_PATH);

  const startX = Math.max(0, Math.min(startX_px, image.width));
  const endX   = Math.max(startX + 1, Math.min(endX_px, image.width));
  const startY = Math.max(0, Math.min(startY_px, image.height - 1));

  const cropWidth   = endX - startX;
  const totalHeight = image.height - startY;
  const baseStep    = Math.floor(totalHeight / itemCount);

  if (cropWidth <= 0) throw new Error(`cropWidth غیرمعتبر است: startX=${startX}, endX=${endX}, image.width=${image.width}`);
  if (baseStep <= 0) throw new Error(`ارتفاع هر برش صفر شد. startY=${startY}, image.height=${image.height}, itemCount=${itemCount}`);

  for (let i = 0; i < itemCount; i++) {
    const sy = startY + i * baseStep;
    const thisHeight = (i === itemCount - 1) ? (image.height - sy) : baseStep;
    if (thisHeight <= 0) break;

    const canvas = createCanvas(cropWidth, thisHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, startX, sy, cropWidth, thisHeight, 0, 0, cropWidth, thisHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `bao001-${String(i + 1).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outputFileName), buffer);
    console.log(`✅ Created: ${outputFileName} (x=${startX}, y=${sy}, w=${cropWidth}, h=${thisHeight})`);
  }
})().catch(err => {
  console.error('❌ Slice error:', err);
  process.exit(1);
});
