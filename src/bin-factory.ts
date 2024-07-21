import { PackingAlgorithm as Bin, PackingAlgorithmClass } from '@src/packing-algorithm';

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

  private _create_bin() {
    return new (this._packAlgo as unknown as new (width: number, height: number, ...args: any[]) => Bin)(this._width, this._height, this._rot);
  }

  is_empty(): boolean {
    return this._count < 1;
  }

  fitness(width: number, height: number): number | null {
    if (!this._refBin) {
      this._refBin = this._create_bin();
    }
    return this._refBin.fitness(width, height);
  }

  fits_inside(width: number, height: number): boolean {
    if (!this._refBin) {
      this._refBin = this._create_bin();
    }
    return this._refBin._fitsSurface(width, height);
  }

  new_bin(): Bin | null {
    if (this._count > 0) {
      this._count -= 1;
      return this._create_bin();
    } else {
      return null;
    }
  }
}

export { BinFactory };
