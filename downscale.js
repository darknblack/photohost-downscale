import sharp from 'sharp';

async function downscaleImage(props) {
  const { imageDir, outputDir, targetWidth, targetHeight, targetQuality, imageChunk } = props;

  try {
    for (const imageName of imageChunk) {
      const imagePath = `${imageDir}/${imageName}`;
      const outputPath = `${outputDir}/${imageName}`;
      const ext = imagePath.split('.').pop().toLowerCase();

      const isJpeg = ext === 'jpeg' || ext === 'jpg';
      const isPng = ext === 'png';

      if (isJpeg) {
        await sharp(imagePath)
          .resize(targetWidth, targetHeight)
          .jpeg({ quality: targetQuality })
          .withMetadata()
          .toFile(outputPath);
      } else if (isPng) {
        await sharp(imagePath)
          .resize(targetWidth, targetHeight)
          .png({ quality: targetQuality })
          .withMetadata()
          .toFile(outputPath);
      } else if (ext === 'gif') {
        await sharp(imagePath, {
          animated: true,
        })
          .resize(targetWidth, targetHeight)
          .withMetadata()
          .toFile(outputPath);
      }

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
