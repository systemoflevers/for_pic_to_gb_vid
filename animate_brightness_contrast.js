import {pixelArrayToTiles} from "./gb_rendering/modules/data_conversion.js"
import { imageDataToColourIndexedTiles } from "./image_processing/modules/image_conversion.js";
import { imageToCanvas } from "./image_processing/modules/image_conversion.js";
import { toNearestColourIndex } from "./image_processing/modules/dither.js";
import { TileMap, TileSet } from "./gb_rendering/modules/tile_collections.js";
import { drawCanvas } from "./gb_rendering/modules/rendering.js";
import { kGreenColours } from "./gb_rendering/modules/colours.js";


function animationFramePromise() {
  return new Promise((res) => requestAnimationFrame(res));
}

/**
 * 
 * @param {Array<(r:number)=>void>} animations 
 * @param {number} r 
 */
function multiEase(animations, r) {
  const n = animations.length;
  for (let i = 0; i < n; ++i) {
    if (r < i / n) continue;
    if (r < 1 && r >= (i + 1) / n) continue; // special case for r === 1

    const localR = (r - i / n) / ((i + 1) / n);
  }
}

/**
 * 
 * @param {number} x 
 * @returns {number}
 */
function easeInSine(x) {
  return 1 - Math.cos((x * Math.PI) / 2);
}

/**
 * 
 * @param {number} x 
 * @returns {number}
 */
function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

/**
 * 
 * @param {HTMLImageElement} srcImage 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} targetCtx 
 */
function renderImage(srcImage, canvas, targetCtx, {contrast: contrast = 1, brightness: brightness = 1} = {}) {
  const ctx = canvas.getContext('2d');

  ctx.filter = `contrast(${contrast}) brightness(${brightness})`;
  imageToCanvas(srcImage, canvas);
  const imageData = ctx.getImageData(0,0, 160, 144);

  const tiles = imageDataToColourIndexedTiles(
    imageData,
    toNearestColourIndex,
    (pixel) => pixelArrayToTiles(pixel, 160, 144).tiles
  );

  const tileSet = new TileSet(360);
  for (let i = 0; i < 360; ++i) {
    tileSet.setTile(i, tiles[i]);
  }
  const tileMap = TileMap.makeFullMap(20, 18);
  tileMap.tileSet = tileSet;
  
  drawCanvas(ctx, imageData, tileMap, tileSet, kGreenColours, 0, 0);
  
  targetCtx.drawImage(canvas, 1082, 483, 854, 769);
}

async function doStuff() {
  const bgImage = new Image();
  bgImage.src = 'pic to gb-f001924.png';
  await bgImage.decode();

  /** @type{HTMLCanvasElement} */
  const canvas = document.querySelector('canvas');

  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;
  //ctx.drawImage(bgImage, 0, 0, 3840, 2160);
  

  const image = new Image();
  image.src = 'low_res_to_dostuff.png';
  await image.decode();


  const gbSizedCanvas = document.createElement('canvas');
  gbSizedCanvas.width = 160;
  gbSizedCanvas.height = 144;
  
  renderImage(image, gbSizedCanvas, ctx);

  const contrastRenderer = (r) => renderImage(image, gbSizedCanvas, ctx, {contrast: 3 * r})
  const a = document.createElement('a');
  //const startTime = performance.now();
  //const duration = 1000;
  //while (true) {
  //  const now = await animationFramePromise();
  //  const delta = now - startTime;
  //  if (delta > duration) return;
  //  contrastRenderer(easeInOutSine(delta / duration));
  //}
  for (let i = 0; i < 100; ++i) {
    contrastRenderer(easeInSine(i / 100));
    //const now = await animationFramePromise();

    const dataUrl = canvas.toDataURL();
    let fileID = '0000000' + i
    fileID = fileID.substring(fileID.length - 8);
    a.download = `frame${fileID}.png`;
    a.href = dataUrl;
    a.click();
  }
}

doStuff();