import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'bao-001.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'sliced');

// ===== تنظیمات شما (بر حسب CSS px) =====
const VIEWPORT_WIDTH_CSS = 120;     // عرض     
const startY_css = 1;              // فاصله از بالا (CSS px)
const trimRight_css = 70;           // مقدار حاشیه‌ای که از چپ حذف می‌شود (CSS px)
const itemCount = 100;              // تعداد آیتم‌های برش )

// =======================================

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const image = await loadImage(INPUT_PATH);

  // تخمین DPR از عرض خروجی اسکرین‌شات
  const DPR = image.width / VIEWPORT_WIDTH_CSS;

  const startY = Math.round(startY_css * DPR);
  const trimRight = Math.round(trimRight_css * DPR);

  const cropWidth = image.width - trimRight; // عرض نهایی بدون بخش راست (شماره)
  const totalHeight = image.height - startY;
  const baseStep = Math.floor(totalHeight / itemCount);

  for (let i = 0; i < itemCount; i++) {
    const sy = startY + i * baseStep;
    const thisHeight = (i === itemCount - 1) ? (image.height - sy) : baseStep;
    if (thisHeight <= 0) break;

    const canvas = createCanvas(cropWidth, thisHeight);
    const ctx = canvas.getContext('2d');

    // از (0,sy) تا cropWidth ببُر؛ بخش راست (trimRight) حذف می‌شود
    ctx.drawImage(image, 0, sy, cropWidth, thisHeight, 0, 0, cropWidth, thisHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `bao001-${String(i + 1).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outputFileName), buffer);
    console.log(`✅ Created: ${outputFileName}  (DPR=${DPR.toFixed(2)}, y=${sy}, h=${thisHeight})`);
  }
})().catch(err => {
  console.error('❌ Slice error:', err);
  process.exit(1);
});
