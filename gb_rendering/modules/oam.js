import { TileSet } from "./tile_collections.js";

/**
 * An OAM entry.
 */
class Entry {
  constructor(y, x, tileIndex,
    {priority = 0, yFlip = false, xFlip = false, palette = 0 } = {}) {
    this.y = y;
    this.x = x;
    this.tileIndex = tileIndex;
    this.priority = priority;
    this.yFlip = yFlip;
    this.xFlip = xFlip;
    this.palette = palette ? 1 : 0;
  }

  /**
   * 
   * @param {Uint8Array} bytes 
   * @returns {!Entry}
   */
  static fromBytes(bytes) {
    const [y, x, tileIndex, attributes] = bytes
    const priority = attributes & 0b10000000;
    const yFlip = Boolean(attributes & 0b01000000);
    const xFlip = Boolean(attributes & 0b00100000);
    const palette = attributes & 0b00010000;

    return new Entry(y, x, tileIndex, {priority, yFlip, xFlip, palette});
  }

  /**
   * Get the pixel from a tile in the tile's local 8x8 coordinate space.
   * 0, 0 is the top left pixel of the tile.
   * @param {number} x 
   * @param {number} y 
   * @param {!TileSet} tileSet Tile set to get tile data from.
   * @param {boolean} isTall
   */
  getLocalPixel(x, y, tileSet, isTall) {
    // TODO
    if (this.xFlip) {
      x = 7 - x;
    }
    if (this.yFlip) {
      y = 7 - y;
    }
    return tileSet.getPixel(this.tileIndex, x, y);
    // remember to deal with flipping
  }
}

class ObjectAttributeMemory {
  /**
   * @param {Entry[]} entries 
   */
  constructor(entries) {
    /** @type{Entry[]} */
    this.entries = entries;
  }

  /**
   * 
   * @param {Uint8Array} bytes 
   */
  static fromBytes(bytes) {
    const entries = [];
    for (let i = 0; i < bytes.length / 4; ++i) {
      entries.push(Entry.fromBytes(bytes.subarray(i * 4, i * 4 + 4)));
    }
    return new ObjectAttributeMemory(entries);
  }

  /**
   * Gets the objects to be drawn for a given viewport row
   * @param {number} row 
   * @param {boolean} isTall Should the objects be 8x16, if not then they are 8x8.
   * @param {number} max The maximum number of entries to return.
   * @returns {Entry[]}
   */
  getObjectsForRow(row, isTall = false, max=10) {
    const matchingEntries = [];
    const height = isTall ? 16 : 8
    for (const entry of this.entries) {
      // object coordinates are shifted up by 16 pixels
      if (entry.y - 16 > row) continue;
      if (entry.y - 16 + height <= row) continue;
      matchingEntries.push(entry);
      if (matchingEntries.length > max) break;
    }
    return matchingEntries;
  }

  /**
   * 
   * @param {*} row 
   * @param {*} col 
   * @param {*} tileSet 
   * @param {Entry[]} rowEntries 
   * @param {*} palette 
   * @param {*} isTall 
   * @returns 
   */
  getPixel(row, col, tileSet, rowEntries, palettes, isTall = false) {
    row += 16;
    // object coordinates are offset to the left by 8 pixels
    col += 8;
    let minEntry;
    let minPixel;
    for (const entry of rowEntries) {
      if (entry.x > col) continue;
      if (entry.x + 7 < col) continue;
      const tileX = col - entry.x;
      // assuming the y is in range;
      const tileY = row - entry.y;
      const pixelValue = entry.getLocalPixel(tileX, tileY, tileSet, isTall);
      if (pixelValue === 0) continue;
      if (entry.x >= (minEntry?.x ?? Number.MAX_SAFE_INTEGER)) continue;
      minEntry = entry;
      const palette = palettes[entry.palette];
      minPixel = palette[pixelValue];
    }
    if (!minEntry) return {pixel: undefined, priority: undefined};
    return {pixel: minPixel, priority: minEntry.priority}
  }

  getPixelGetterForRow(row, tileSet, palettes, isTall = false, max = 10) {
    const rowEntries = this.getObjectsForRow(row, isTall, max);
    return (x) => this.getPixel(row, x, tileSet, rowEntries, palettes, isTall);
  }
}

export {
  Entry,
  ObjectAttributeMemory,
}