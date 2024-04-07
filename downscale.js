import sharp from 'sharp';

(async () => {
  const t0 = performance.now();
  const targetWidth = 1920;
  const targetHeight = 1080;
  await sharp('./image.jpg')
    .resize(targetWidth, targetHeight)
    .jpeg({ quality: 100 })
    .withMetadata()
    .toFile('./image-downscaled.jpg');

  const t1 = performance.now();
  console.log(`Time taken: ${(t1 - t0) / 1000} seconds`);
})();
