// scripts/baby/bao-001s.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

// ===== مسیرها =====
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// اگر ساختار پروژه فرق دارد، این‌ها را اصلاح کن
const INPUT_PATH = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'bao-001.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'daily', 'baby', 'babyother', 'sliced');

// ===== تنظیمات (پیکسل واقعی تصویر) =====
const startX_px = 15;    // شروع برش از لبه چپ (px)
const endX_px   = 430;  // پایان برش (px)
const startY_px = 15;    // شروع برش از بالا (px)
const itemCount = 100;  // تعداد آیتم‌ها

// ===== گزینه‌های کمکی =====
const CLEAR_OUTPUT_DIR = true;                 // پاک‌سازی خروجی‌های قبلی؟
const VERSION_TAG      = `run-${Date.now()}`;  // برای اطمینان از اجرای نسخه جدید

// ===== شروع =====
console.log('================ SLICE RUN ================');
console.log('Version      :', VERSION_TAG);
console.log('Input path   :', INPUT_PATH);
console.log('Output dir   :', OUTPUT_DIR);
console.log('Params (px)  :', { startX_px, endX_px, startY_px, itemCount });
console.log('Options      :', { CLEAR_OUTPUT_DIR });
console.log('===========================================');

// چک وجود فایل ورودی
if (!fs.existsSync(INPUT_PATH)) {
  console.error('❌ Input image not found:', INPUT_PATH);
  process.exit(1);
}

// ساخت پوشه خروجی
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// پاک‌سازی اختیاری خروجی
if (CLEAR_OUTPUT_DIR) {
  try {
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.toLowerCase().endsWith('.png'));
    for (const f of files) fs.unlinkSync(path.join(OUTPUT_DIR, f));
    console.log(`🧹 Cleared ${files.length} PNG(s) in output dir.`);
  } catch (e) {
    console.warn('⚠️ Could not clear output dir:', e.message);
  }
}

(async () => {
  const image = await loadImage(INPUT_PATH);
  console.log('Image size   :', { width: image.width, height: image.height });

  // امن‌سازی ورودی‌ها (clamp)
  const startX = Math.max(0, Math.min(startX_px, image.width));
  const endX   = Math.max(startX + 1, Math.min(endX_px, image.width)); // حداقل 1px عرض
  const startY = Math.max(0, Math.min(startY_px, image.height - 1));

  const cropWidth   = endX - startX;
  const totalHeight = image.height - startY;
  const baseStep    = Math.floor(totalHeight / itemCount);

  console.log('Effective    :', { startX, endX, cropWidth, startY, totalHeight, baseStep });

  if (cropWidth <= 0) {
    throw new Error(`cropWidth<=0 (startX=${startX}, endX=${endX}, imgW=${image.width})`);
  }
  if (baseStep <= 0) {
    throw new Error(`baseStep<=0 (startY=${startY}, imgH=${image.height}, itemCount=${itemCount})`);
  }

  for (let i = 0; i < itemCount; i++) {
    const sy = startY + i * baseStep;
    const thisHeight = (i === itemCount - 1) ? (image.height - sy) : baseStep;
    if (thisHeight <= 0) break;

    const canvas = createCanvas(cropWidth, thisHeight);
    const ctx = canvas.getContext('2d');

    // برش و رسم روی بوم
    ctx.drawImage(image, startX, sy, cropWidth, thisHeight, 0, 0, cropWidth, thisHeight);

    const buffer = canvas.toBuffer('image/png');
    const outputFileName = `bao001-${String(i + 1).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outputFileName), buffer);

    console.log(`✅ Created: ${outputFileName} (x=${startX}, y=${sy}, w=${cropWidth}, h=${thisHeight})`);
  }

  console.log('🎯 DONE.');
})().catch(err => {
  console.error('❌ Slice error:', err);
  process.exit(1);
});
