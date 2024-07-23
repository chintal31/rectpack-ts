import { PackingAlgorithm as Bin } from '@src/packing-algorithm';
import { PackingAlgorithmClass } from '@src/types';

class BinFactory {
  private _width: number;
  private _height: number;
  private _count: number;
  private _rot: boolean;
  private _packAlgo: PackingAlgorithmClass;
  private _refBin: Bin | null = null;

  constructor(width: number, height: number, count: number, packAlgo: PackingAlgorithmClass, rot: boolean) {
    this._width = width;
    this._height = height;
    this._rot = rot;
    this._count = count;
    this._packAlgo = packAlgo;
  }

  private _createBin() {
    return new (this._packAlgo as unknown as new (width: number, height: number, ...args: any[]) => Bin)(this._width, this._height, this._rot);
  }

  isEmpty(): boolean {
    return this._count < 1;
  }

  fitness(width: number, height: number): number | null {
    if (!this._refBin) {
      this._refBin = this._createBin();
    }
    return this._refBin.fitness(width, height);
  }

  fitsInside(width: number, height: number): boolean {
    if (!this._refBin) {
      this._refBin = this._createBin();
    }
    return this._refBin._fitsSurface(width, height);
  }

  newBin(): Bin | null {
    if (this._count > 0) {
      this._count -= 1;
      return this._createBin();
    } else {
      return null;
    }
  }
}

export { BinFactory };
