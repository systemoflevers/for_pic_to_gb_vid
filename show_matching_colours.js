import { toNearestColourIndex } from "./image_processing/modules/dither.js";
import { kGreenColours } from "./gb_rendering/modules/colours.js";

async function doStuff() {
  /** @type{HTMLCanvasElement[]} */
  const canvases = document.querySelectorAll('canvas');

  const img = new Image();
  img.src = 'low_res_to_dostuff.png';
  await img.decode();

  for (let c = 0; c < 4; ++c) {
    const ctx = canvases[c].getContext('2d');
    const canvas = canvases[c];
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const modifiedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colourIndexes = toNearestColourIndex(modifiedImageData);

    const indexToShow = c;
    for (let i = 0; i < colourIndexes.length; ++i) {
      if (colourIndexes[i] !== indexToShow) {
        for (let j = 0; j < 4; ++j) {
          imageData.data[i * 4 + j] = 0;
          modifiedImageData.data[i * 4 + j] = 0;
        }
      } else {
        for (let j = 0; j < 3; ++j) {
          modifiedImageData.data[i * 4 + j] = kGreenColours[colourIndexes[i]][j];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    canvases[c + 4].getContext('2d').putImageData(modifiedImageData, 0, 0);
  }
}

doStuff();