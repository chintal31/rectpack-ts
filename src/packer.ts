import { PackingAlgorithm as Bin } from './packing-algorithm';
import { SORT_AREA } from './sorting';
import { MaxRectsBssf } from './max-rects';
import { RectangleWithBinCount, BinSummary, PackageBin, PackingAlgorithmClass, Sorting } from './types';
import { PackerBase } from './packer-base';
import { PackerBBF } from './packer-mixins';

class Packer {
  private packerInstance: PackerBase;

  constructor({
    binAlgo = PackerBBF,
    packAlgo = MaxRectsBssf,
    sortAlgo = SORT_AREA,
    rotation = true,
  }: {
    binAlgo?: PackageBin;
    packAlgo?: PackingAlgorithmClass;
    sortAlgo?: Sorting;
    rotation?: boolean;
  } = {}) {
    this.packerInstance = new binAlgo(packAlgo, sortAlgo, rotation);
  }

  get numberOfBins() {
    return this.packerInstance.numberOfBins;
  }

  getBin(key: number): Bin {
    return this.packerInstance.getBin(key);
  }

  addBin(width: number, height: number, count = 1, extraParams: any = {}) {
    this.packerInstance.addBin(width, height, count, extraParams);
  }

  addRect(width: number, height: number, rid: any = null) {
    this.packerInstance.addRect(width, height, rid);
  }

  rectList(): RectangleWithBinCount[] {
    return this.packerInstance.rectList();
  }

  binList(): BinSummary[] {
    return this.packerInstance.binList();
  }

  validatePacking() {
    this.packerInstance.validatePacking();
  }

  pack() {
    this.packerInstance.pack();
  }

  reset() {
    this.packerInstance.reset();
  }
}

export { Packer };
