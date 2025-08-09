import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('daily');

// بایت‌های یک PNG شفاف 1×1
const tinyPng = Buffer.from(
  '89504e470d0a1a0a0000000d4948445200000001000000010806000000' +
  '1f15c4890000000a49444154789c6360000002000100' +
  '05fe02fea7d8d90000000049454e44ae426082',
  'hex'
);

function replacePngFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (fullPath.includes('sliced')) continue;
      replacePngFiles(fullPath);
    } else if (item.isFile() && item.name.endsWith('.png')) {
      fs.writeFileSync(fullPath, tinyPng); // جایگزینی با PNG معتبر
      console.log('✔ Replaced with tiny PNG:', fullPath);
    }
  }
}

replacePngFiles(baseDir);
