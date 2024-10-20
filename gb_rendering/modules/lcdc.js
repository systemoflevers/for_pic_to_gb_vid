class LCDControl {
  /**
   * 
   * @param {boolean} enable 
   * @param {boolean | number} winTileMap 
   * @param {boolean} winEnable 
   * @param {boolean | number} bgWinTiles 
   * @param {boolean | number} bgTileMap 
   * @param {"big" | "small"} objSize 
   * @param {boolean} objEnable 
   * @param {boolean} bgWinEnable 
   */
  constructor(enable, winTileMap, winEnable, bgWinTiles, bgTileMap, objSize, objEnable, bgWinEnable) {
    /** @type{boolean} */
    this.enable = enable;
    /** @type{number} */
    this.winTileMap = winTileMap ? 1 : 0;
    /** @type{boolean} */
    this.winEnable = winEnable;
    /** @type{number} */
    this.bgWinTiles = bgWinTiles ? 1 : 0;
    /** @type{number} */
    this.bgTileMap = bgTileMap ? 1 : 0;
    /** @type{number} */
    this.objSize = objSize === 'big' ? 1 : 0;
    /** @type{boolean} */
    this.objEnable = objEnable;
    /** @type{bgWinEnable} */
    this.bgWinEnable = bgWinEnable;
  }
}

export {
  LCDControl,
}