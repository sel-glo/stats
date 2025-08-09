import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'bao-001.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'sliced');

// ===== تنظیمات شما (بر حسب CSS px) =====
const startX_css = 5;             // فاصله از چپ (CSS px) برای حذف ستون اول
const VIEWPORT_WIDTH_CSS = 80;    // عرض بخشی که می‌خواهیم نگه داریم (CSS px)
const startY_css = 2;              // فاصله از بالا (CSS px)
const itemCount = 100;             // تعداد آیتم‌های برش

// =======================================

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const image = await loadImage(INPUT_PATH);

  // تخمین DPR از عرض خروجی اسکرین‌شات
  const DPR = image.width / (startX_css + VIEWPORT_WIDTH_CSS);

  const startX = Math.round(startX_css * DPR);
  const startY = Math.round(startY_css * DPR);
  const cropWidth = Math.round(VIEWPORT_WIDTH_CSS * DPR);

  const totalHeight = image.height - startY;
  const baseStep = Math.floor(totalHeight / itemCount);

  for (let i = 0; i < itemCount; i++) {
    const sy = startY + i * baseStep;
    const thisHeight = (i === itemCount - 1) ? (image.height - sy) : baseStep;
    if (thisHeight <= 0) break;

    const canvas = createCanvas(cropWidth, thisHeight);
    const ctx = canvas.getContext('2d');

    // از startX تا cropWidth ببُر
    ctx.drawImage(image, startX, sy, cropWidth, thisHeight, 0, 0, cropWidth, thisHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `bao001-${String(i + 1).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outputFileName), buffer);
    console.log(`✅ Created: ${outputFileName}  (DPR=${DPR.toFixed(2)}, x=${startX}, y=${sy}, w=${cropWidth}, h=${thisHeight})`);
  }
})().catch(err => {
  console.error('❌ Slice error:', err);
  process.exit(1);
});
