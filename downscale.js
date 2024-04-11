import sharp from 'sharp';

async function downscaleImage(props) {
  const { imageDir, outputDir, targetWidth, targetHeight, targetQuality, imageName } = props;

  try {
    const imagePath = `${imageDir}/${imageName}`;
    const outputPath = `${outputDir}/${imageName}`;
    await sharp(imagePath)
      .resize(targetWidth, targetHeight)
      .jpeg({ quality: targetQuality })
      .withMetadata()
      .toFile(outputPath);

    process.send({ status: 'complete' }); // Signal completion with processed count
  } catch (error) {
    console.error('Error during image processing:', error);
    process.send({ status: 'error', error }); // Signal error
  } finally {
  }
}

process.on('message', async message => {
  if (message.imageName) {
    await downscaleImage(message);
  }
});
