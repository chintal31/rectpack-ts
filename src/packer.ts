import { BinFactory } from '@src/bin-factory';
import { PackingAlgorithmClass, PackingAlgorithm as Bin } from '@src/packing-algorithm';
import { SORT_AREA, SORT_NONE, Sorting } from '@src/sorting';
import { MaxRectsBssf } from '@src/max-rects';

type PackerBin = [number, number, number, string | null];
type PackerRect = [number, number, string | null];
type RectangleWithBinCount = [number, number, number, number, number, string | null];

class PackerOnline {
  private _rotation: boolean;
  private _packAlgo: PackingAlgorithmClass;
  protected _closed_bins: Bin[] = [];
  protected _open_bins: Bin[] = [];
  private _empty_bins: Map<number, BinFactory> = new Map();
  private _bin_count = 0;

  constructor(packAlgo: PackingAlgorithmClass, rotation = true) {
    this._rotation = rotation;
    this._packAlgo = packAlgo;
    this.reset();
  }

  *[Symbol.iterator]() {
    yield* this._closed_bins;
    yield* this._open_bins;
  }

  get numberOfBins() {
    return this._closed_bins.length + this._open_bins.length;
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

    if (key < this._closed_bins.length) {
      return this._closed_bins[key];
    } else {
      return this._open_bins[key - this._closed_bins.length];
    }
  }

  protected _newOpenBin(width: number | null = null, height: number | null = null, _rid: string | null = null): Bin | null {
    const factoriesToDelete: number[] = [];
    let newBin: Bin | null = null;

    for (const [key, binFac] of this._empty_bins.entries()) {
      if (!binFac.fits_inside(width, height)) {
        continue;
      }

      newBin = binFac.new_bin();
      if (newBin === null) {
        continue;
      }
      this._open_bins.push(newBin);

      if (binFac.is_empty()) {
        factoriesToDelete.push(key);
      }

      break;
    }

    for (const f of factoriesToDelete) {
      this._empty_bins.delete(f);
    }

    return newBin;
  }

  addBin(width: number, height: number, count = 1) {
    const binFactory = new BinFactory(width, height, count, this._packAlgo, this._rotation);
    this._empty_bins.set(this._bin_count++, binFactory);
  }

  rectList(): RectangleWithBinCount[] {
    const rectangles: RectangleWithBinCount[] = [];
    let binCount = 0;

    for (const bin of this) {
      for (const rect of bin.rectangles) {
        rectangles.push([binCount, rect.x, rect.y, rect.width, rect.height, rect.rid]);
      }
      binCount += 1;
    }

    return rectangles;
  }

  binList(): [number, number][] {
    return [...this].map((bin) => [bin.width, bin.height]);
  }

  validatePacking() {
    for (const bin of this) {
      bin.validatePacking();
    }
  }

  reset() {
    this._closed_bins = [];
    this._open_bins = [];
    this._empty_bins = new Map();
    this._bin_count = 0;
  }
}

class PackerBase extends PackerOnline {
  private _sortAlgo: (rectangles: PackerRect[]) => PackerRect[];
  private _avail_bins: PackerBin[] = [];
  private _avail_rect: PackerRect[] = [];
  private _sorted_rect: PackerRect[] = [];

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
    this._avail_bins.push([width, height, count, extraParams]);
  }

  addRect(width: number, height: number, rid: any = null) {
    this._avail_rect.push([width, height, rid]);
  }

  private _isEverythingReady(): boolean {
    return this._avail_rect.length > 0 && this._avail_bins.length > 0;
  }

  pack() {
    this.reset();

    if (!this._isEverythingReady()) {
      return;
    }

    for (const [width, height, count] of this._avail_bins) {
      super.addBin(width, height, count);
    }

    this._sorted_rect = this._sortAlgo(this._avail_rect);

    for (const rect of this._sorted_rect) {
      (this as unknown as PackerBBFMixin | PackerBNFMixin | PackerBFFMixin).fitRect(...rect);
    }
  }
}

const firstItem = (array: [number, Bin]): number => {
  return array[0];
};
class PackerBBFMixin extends PackerOnline {
  // Define item getter function (equivalent to Python's operator.itemgetter)

  fitRect(width: number, height: number, rid?: any): boolean {
    // Try packing into open bins
    let fit: [number, Bin][] = this._open_bins.map((b) => [b.fitness(width, height), b]);
    fit = fit.filter(([fitness, _bin]) => fitness !== null);

    try {
      const [, best_bin] = fit.reduce((min, current) => (firstItem(current) < firstItem(min) ? current : min));
      best_bin.addRect(width, height, rid);
      return true;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Reduce of empty array with no initial value')) {
        // console.log('Caught specific TypeError: Reduce of empty array with no initial value. No action needed.');
      } else {
        // Rethrow or handle other errors
        console.error('Unexpected error:', error);
        throw error;
      }
    }

    // Try packing into a new open bin
    while (true) {
      const new_bin = this._newOpenBin(width, height);

      if (!new_bin) return false;

      if (new_bin.addRect(width, height, rid)) {
        return true;
      }
    }
  }
}

class PackerBNFMixin extends PackerOnline {
  /**
   * BNF (Bin Next Fit): Only one open bin at a time.  If the rectangle
   * doesn't fit, close the current bin and go to the next.
   */

  fitRect(width: number, height: number, rid?: string): { width: number; height: number; rid?: string } | null {
    while (true) {
      // if there are no open bins, try to open a new one
      if (this._open_bins.length === 0) {
        // can we find an unopened bin that will hold this rect?
        const newBin = this._newOpenBin(width, height, rid);
        if (newBin === null) {
          return null;
        }
      }

      // we have at least one open bin, so check if it can hold this rect
      const rect = this._open_bins[0].addRect(width, height, rid);
      if (rect !== null) {
        return rect;
      }

      // since the rect doesn't fit, close this bin and try again
      const closedBin = this._open_bins.shift();
      if (closedBin) {
        this._closed_bins.push(closedBin);
      }
    }
  }
}

class PackerBFFMixin extends PackerOnline {
  /**
   * BFF (Bin First Fit): Pack rectangle in first bin it fits
   */

  fitRect(width: number, height: number, rid?: string): { width: number; height: number; rid?: string } | null {
    // see if this rect will fit in any of the open bins
    for (const b of this._open_bins) {
      const rect = b.addRect(width, height, rid);
      if (rect !== null) {
        return rect;
      }
    }

    while (true) {
      // can we find an unopened bin that will hold this rect?
      const newBin = this._newOpenBin(width, height, rid);
      if (newBin === null) {
        return null;
      }

      // _newOpenBin may return a bin that's too small,
      // so we have to double-check
      const rect = newBin.addRect(width, height, rid);
      if (rect !== null) {
        return rect;
      }
    }
  }
}

type Constructor<T = object> = new (...args: any[]) => T;

function applyMixins(derivedCtor: Constructor, baseCtors: Constructor[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

class PackerBBF extends PackerBase {
  // Empty class but will have methods from PackerBBFMixin via mixin
}

class PackerBNF extends PackerBase {
  // Empty class but will have methods from PackerBNFMixin via mixin
}

class PackerBFF extends PackerBase {
  // Empty class but will have methods from PackerBFFMixin via mixin
}

applyMixins(PackerBBF, [PackerBBFMixin]);
applyMixins(PackerBNF, [PackerBNFMixin]);
applyMixins(PackerBFF, [PackerBFFMixin]);

type PackageBin = new (...args: any[]) => PackerBBF | PackerBNF | PackerBFF;

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

  rectList(): any[] {
    return this.packerInstance.rectList();
  }

  binList(): [number, number][] {
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

export {
  PackerBBF,
  Packer,
  PackerRect,
  PackerBin,
  PackerBNF,
  PackerBFF,
  PackerOnline,
  PackerBase,
  PackerBBFMixin,
  PackerBNFMixin,
  PackerBFFMixin,
  PackingAlgorithmClass,
  PackageBin,
};
