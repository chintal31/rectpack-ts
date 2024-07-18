import { PackingAlgorithm as Bin, PackingAlgorithmInstance } from '@src/packing-algorithm';

class BinFactory {
  private _width: number;
  private _height: number;
  private _count: number;
  private _pack_algo: PackingAlgorithmInstance;
  private _algo_kwargs: Record<string, any>;
  private _algo_args: any[];
  private _ref_bin: Bin | null = null;

  constructor(width: number, height: number, count: number, pack_algo: PackingAlgorithmInstance, ...args: any[]) {
    this._width = width;
    this._height = height;
    this._count = count;
    this._pack_algo = pack_algo;
    this._algo_args = args;
    this._algo_kwargs = args[args.length - 1]; // Last argument as kwargs
  }

  private _create_bin() {
    return new (this._pack_algo as unknown as new (width: number, height: number, ...args: any[]) => Bin)(
      this._width,
      this._height,
      ...this._algo_args,
    );
  }

  is_empty(): boolean {
    return this._count < 1;
  }

  fitness(width: number, height: number): number | null {
    if (!this._ref_bin) {
      this._ref_bin = this._create_bin();
    }
    return this._ref_bin.fitness(width, height);
  }

  fits_inside(width: number, height: number): boolean {
    if (!this._ref_bin) {
      this._ref_bin = this._create_bin();
    }
    return this._ref_bin._fitsSurface(width, height);
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
