import fs from 'fs/promises';
import os from 'os';
import { spawn } from 'child_process';
import { promisify } from 'util';

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

    const imageList = await fs.readdir(imageDir);
    const chunkSize = Math.ceil(imageList.length / numCores);

    // Divide image list into chunks
    const imageChunks = [];
    for (let i = 0; i < imageList.length; i += chunkSize) {
      imageChunks.push(imageList.slice(i, i + chunkSize));
    }

    // Process image chunks in parallel
    const childProcesses = [];

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
          if (message.status === 'complete') {
            console.log('Image chunk processed successfully.');
          } else if (message.status === 'error') {
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
