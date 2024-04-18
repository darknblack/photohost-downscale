import sharp from 'sharp';

const longestSideSize = 1920;
const targetQuality = 80;

async function downscaleImage(props) {
  const { imageDir, outputDir, imageChunk } = props;

  try {
    for (const imageName of imageChunk) {
      const imagePath = `${imageDir}/${imageName}`;
      const outputPath = `${outputDir}/${imageName}`;
      // const ext = imagePath.split('.').pop().toLowerCase();
      // const isJpeg = ext === 'jpeg' || ext === 'jpg';
      // const isPng = ext === 'png';

      const metadata = await sharp(imagePath).metadata();
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

      await sharp(imagePath)
        .resize(newWidth, newHeight)
        .jpeg({ quality: targetQuality })
        .withMetadata()
        .toFile(outputPath);

      process.send({ status: 'progress', imagePath });
    }
    process.exit(0);
  } catch (error) {
    process.send({ status: 'error', error }); // Signal error to parent process
    process.exit(1);
  }
}

process.on('message', async message => {
  await downscaleImage(message);
});
