import { Rectangle } from '@src/geometry';
import { PackerBBF, PackerBNF, PackerBFF } from '@src/packer-mixins';
import { MaxRectsBaf, MaxRectsBl, MaxRectsBlsf, MaxRectsBssf } from '@src/max-rects';
import { SORT_AREA, SORT_PERI, SORT_DIFF, SORT_SSIDE, SORT_LSIDE, SORT_RATIO, SORT_NONE } from '@src/sorting';

type PackerBin = [number, number, number, string | null];
type PackerRect = [number, number, string | null];
type RectangleWithBinCount = {
  binIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rid: string | null;
};
type BinSummary = { width: number; height: number; numberOfRectangles: number; rectangles: Rectangle[] };
type Constructor<T = object> = new (...args: any[]) => T;
type PackageBin = new (...args: any[]) => PackerBBF | PackerBNF | PackerBFF;
type PackingAlgorithms = MaxRectsBl | MaxRectsBssf | MaxRectsBaf | MaxRectsBlsf;
type PackingAlgorithmClass = new (...args: any[]) => PackingAlgorithms;
type Sorting = typeof SORT_AREA | typeof SORT_PERI | typeof SORT_DIFF | typeof SORT_SSIDE | typeof SORT_LSIDE | typeof SORT_RATIO | typeof SORT_NONE;

export { PackerBin, PackerRect, RectangleWithBinCount, BinSummary, Constructor, PackageBin, PackingAlgorithms, PackingAlgorithmClass, Sorting };
