import { PackerOnline, PackerBase } from './packer-base';
import { Constructor, PackingAlgorithmClass, Sorting } from './types';
import { PackingAlgorithm as Bin } from './packing-algorithm';

class PackerBBFMixin extends PackerOnline {
  // Define item getter function (equivalent to Python's operator.itemgetter)

  fitRect(width: number, height: number, rid?: any): boolean {
    // Try packing into open bins
    let fit: [number, Bin][] = this._openBins.map((b) => [b.fitness(width, height), b]);
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
      const newBin = this._newOpenBin(width, height);

      if (!newBin) return false;

      if (newBin.addRect(width, height, rid)) {
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
      if (this._openBins.length === 0) {
        // can we find an unopened bin that will hold this rect?
        const newBin = this._newOpenBin(width, height, rid);
        if (newBin === null) {
          return null;
        }
      }

      // we have at least one open bin, so check if it can hold this rect
      const rect = this._openBins[0].addRect(width, height, rid);
      if (rect !== null) {
        return rect;
      }

      // since the rect doesn't fit, close this bin and try again
      const closedBin = this._openBins.shift();
      if (closedBin) {
        this._closedBins.push(closedBin);
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
    for (const b of this._openBins) {
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

function applyMixins(derivedCtor: Constructor, baseCtors: Constructor[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

const firstItem = (array: [number, Bin]): number => {
  return array[0];
};

class PackerBBF extends PackerBase {
  constructor(options: { packAlgo?: PackingAlgorithmClass; sortAlgo?: Sorting; rotation?: boolean } = {}) {
    super(options);
  }
}

class PackerBNF extends PackerBase {
  constructor(options: { packAlgo?: PackingAlgorithmClass; sortAlgo?: Sorting; rotation?: boolean } = {}) {
    super(options);
  }
}

class PackerBFF extends PackerBase {
  constructor(options: { packAlgo?: PackingAlgorithmClass; sortAlgo?: Sorting; rotation?: boolean } = {}) {
    super(options);
  }
}

applyMixins(PackerBBF, [PackerBBFMixin]);
applyMixins(PackerBNF, [PackerBNFMixin]);
applyMixins(PackerBFF, [PackerBFFMixin]);

export { PackerBBF, PackerBNF, PackerBFF, PackerBBFMixin, PackerBNFMixin, PackerBFFMixin };
