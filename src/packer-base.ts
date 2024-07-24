import { BinFactory } from './bin-factory';
import { MaxRectsBssf } from './max-rects';
import { SORT_NONE } from './sorting';
import { RectangleWithBinCount, BinSummary, PackingAlgorithmClass, PackerRect, PackerBin, Sorting } from './types';
import { PackingAlgorithm as Bin } from './packing-algorithm';
import { PackerBBFMixin, PackerBFFMixin, PackerBNFMixin } from './packer-mixins';

class PackerOnline {
  private _rotation: boolean;
  private _packAlgo: PackingAlgorithmClass;
  protected _closedBins: Bin[] = [];
  protected _openBins: Bin[] = [];
  private _emptyBins: Map<number, BinFactory> = new Map();
  private _binCount = 0;

  constructor(packAlgo: PackingAlgorithmClass, rotation = true) {
    this._rotation = rotation;
    this._packAlgo = packAlgo;
    this.reset();
  }

  *[Symbol.iterator]() {
    yield* this._closedBins;
    yield* this._openBins;
  }

  get numberOfBins() {
    return this._closedBins.length + this._openBins.length;
  }

  getBin(key: number): Bin {
    if (!Number.isInteger(key)) {
      throw new TypeError('Indices must be integers');
    }

    const size = this.numberOfBins;

    if (key < 0) {
      key += size;
    }

    if (key < 0 || key >= size) {
      throw new Error('Index out of range');
    }

    if (key < this._closedBins.length) {
      return this._closedBins[key];
    } else {
      return this._openBins[key - this._closedBins.length];
    }
  }

  protected _newOpenBin(width: number | null = null, height: number | null = null, _rid: string | null = null): Bin | null {
    const factoriesToDelete: number[] = [];
    let newBin: Bin | null = null;

    for (const [key, binFac] of this._emptyBins.entries()) {
      if (!binFac.fitsInside(width, height)) {
        continue;
      }

      newBin = binFac.newBin();
      if (newBin === null) {
        continue;
      }
      this._openBins.push(newBin);

      if (binFac.isEmpty()) {
        factoriesToDelete.push(key);
      }

      break;
    }

    for (const f of factoriesToDelete) {
      this._emptyBins.delete(f);
    }

    return newBin;
  }

  addBin(width: number, height: number, count = 1) {
    const binFactory = new BinFactory(width, height, count, this._packAlgo, this._rotation);
    this._emptyBins.set(this._binCount++, binFactory);
  }

  rectList(): RectangleWithBinCount[] {
    const rectangles: RectangleWithBinCount[] = [];
    let binCount = 0;

    for (const bin of this) {
      for (const rect of bin.rectangles) {
        rectangles.push({ binIndex: binCount, x: rect.x, y: rect.y, width: rect.width, height: rect.height, rid: rect.rid });
      }
      binCount += 1;
    }

    return rectangles;
  }

  binList(): BinSummary[] {
    return [...this].map((bin) => ({ width: bin.width, height: bin.height, numberOfRectangles: bin.numberOfRectangles, rectangles: bin.rectList() }));
  }

  validatePacking() {
    for (const bin of this) {
      bin.validatePacking();
    }
  }

  reset() {
    this._closedBins = [];
    this._openBins = [];
    this._emptyBins = new Map();
    this._binCount = 0;
  }
}

class PackerBase extends PackerOnline {
  private _sortAlgo: (rectangles: PackerRect[]) => PackerRect[];
  private _availBins: PackerBin[] = [];
  private _availRect: PackerRect[] = [];
  private _sortedRect: PackerRect[] = [];

  constructor({
    packAlgo = MaxRectsBssf,
    sortAlgo = SORT_NONE,
    rotation = true,
  }: {
    packAlgo?: PackingAlgorithmClass;
    sortAlgo?: Sorting;
    rotation?: boolean;
  } = {}) {
    super(packAlgo, rotation);
    this._sortAlgo = sortAlgo;
  }

  addBin(width: number, height: number, count = 1, extraParams: any = {}) {
    this._availBins.push([width, height, count, extraParams]);
  }

  addRect(width: number, height: number, rid: any = null) {
    this._availRect.push([width, height, rid]);
  }

  private _isEverythingReady(): boolean {
    return this._availRect.length > 0 && this._availBins.length > 0;
  }

  pack() {
    this.reset();

    if (!this._isEverythingReady()) {
      return;
    }

    for (const [width, height, count] of this._availBins) {
      super.addBin(width, height, count);
    }

    this._sortedRect = this._sortAlgo(this._availRect);

    for (const rect of this._sortedRect) {
      (this as unknown as PackerBBFMixin | PackerBNFMixin | PackerBFFMixin).fitRect(...rect);
    }
  }
}

export { PackerBase, PackerOnline };
