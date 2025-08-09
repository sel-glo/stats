// ac-clear-sliced-100png.mjs
// خالی‌کردن محتوای همه‌ی فایل‌های PNG در تمام پوشه‌های `sliced` زیر daily/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', 'daily');

let clearedCount = 0;
let skippedCount = 0;
let slicedDirCount = 0;

function clearPngFilesInSlicedDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'sliced') {
        slicedDirCount++;
        const files = fs.readdirSync(fullPath, { withFileTypes: true });

        for (const f of files) {
          const filePath = path.join(fullPath, f.name);
          if (f.isFile() && path.extname(f.name).toLowerCase() === '.png') {
            fs.writeFileSync(filePath, ''); // فقط خالی می‌کنیم، حذف نمی‌کنیم
            clearedCount++;
            console.log(`✂️ Cleared content: ${filePath}`);
          } else {
            skippedCount++;
          }
        }
      } else {
        clearPngFilesInSlicedDirs(fullPath);
      }
    }
  }
}

try {
  clearPngFilesInSlicedDirs(ROOT_DIR);
  console.log(`\n✅ All sliced 100png file contents cleared.`);
  console.log(`📁 sliced dirs: ${slicedDirCount} | 🧹 PNGs cleared: ${clearedCount} | ⏭ skipped (non-PNG/dirs): ${skippedCount}`);
} catch (err) {
  console.error('❌ Error while clearing sliced 100png:', err);
  process.exit(1);
}
