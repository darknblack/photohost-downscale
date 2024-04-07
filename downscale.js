import sharp from 'sharp';
import fs from 'fs';

const longestSideSize = 1920;

fs.mkdirSync('./downscaled', { recursive: true });

(async () => {
  const t0 = performance.now();
  const inputImage = './input/image.JPG';

  // Remove orientation metadata
  const buffer = await sharp(inputImage).rotate().toBuffer();
  const metadata = await sharp(buffer).metadata();

  // Determine the new dimensions while maintaining aspect ratio
  const width = metadata.width;
  const height = metadata.height;
  let newWidth, newHeight;
  if (width > height) {
    newWidth = longestSideSize;
    newHeight = Math.round(height * (longestSideSize / width));
  } else {
    newHeight = longestSideSize;
    newWidth = Math.round(width * (longestSideSize / height));
  }

  await sharp(buffer).resize(newWidth, newHeight).withMetadata().png({ quality: 80 }).toFile('./downscaled/image.png');

  const t1 = performance.now();
  console.log(`Time taken: ${(t1 - t0) / 1000} seconds`);
})();
