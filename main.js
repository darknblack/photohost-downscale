import fs from 'fs/promises';
import os from 'os';
import { spawn } from 'child_process';

const numCores = os.cpus().length;
const imageDir = './input';
const outputDir = './downscaled';
const targetWidth = 1920;
const targetHeight = 1080;
const targetQuality = 80;

async function main() {
  try {
    // Validate input and output directories
    await fs.access(imageDir);
    await fs.mkdir(outputDir, { recursive: true });

    const imagesExt = ['.jpg', '.png', '.jpeg', '.gif'];
    const imageList = (await fs.readdir(imageDir)).filter(file => {
      const fileExt = file.split('.').pop().toLowerCase();
      return imagesExt.includes(fileExt);
    });
    const chunkSize = Math.ceil(imageList.length / numCores);

    // Divide image list into chunks
    const imageChunks = [];
    for (let i = 0; i < imageList.length; i += chunkSize) {
      imageChunks.push(imageList.slice(i, i + chunkSize));
    }

    // Process image chunks in parallel
    const childProcesses = [];
    let totalProcessed = 0;

    for (const imageChunk of imageChunks) {
      const child = spawn('node', ['downscale.js'], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'], // Enable inter-process communication
      });

      const pr = new Promise(resolve => {
        child.send({
          imageDir,
          outputDir,
          targetWidth,
          targetHeight,
          targetQuality,
          imageChunk,
        });

        // Listen for completion or error messages from child processes
        child.on('message', message => {
          const { status } = message;

          if (status === 'progress') {
            totalProcessed += 1;
            console.log(`Progress (${totalProcessed}/${imageList.length}) -> ${message.imagePath}`);
          }

          if (status === 'error') {
            console.error('Error during image processing:', message.error);
          }
        });

        child.on('exit', exitCode => resolve(exitCode));
      });

      childProcesses.push(pr);
    }

    // Wait for all child processes to finish
    await Promise.all(childProcesses);

    console.log('All images downscaled successfully!');
  } catch (error) {
    console.error('Error during downscaling:', error);
  }
}

main().catch(error => {
  console.error('Main function error:', error);
});
