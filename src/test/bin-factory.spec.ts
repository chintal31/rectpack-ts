import { Packer } from '../packer';
import { PackerBBF, PackerBNF, PackerBFF } from '../packer-mixins';
import { PackingAlgorithm } from '../packing-algorithm';
import { PackageBin } from '../types';

function common(binAlgo: PackageBin, binWidth: number, binHeight: number, rectangles: [number, number][]): Packer {
  const p = new Packer({ binAlgo });
  p.addBin(binWidth, binHeight, rectangles.length);
  for (const [w, h] of rectangles) {
    p.addRect(w, h);
  }
  p.pack();
  return p;
}

describe('Bin factory', () => {
  let rectangles: [number, number][] = [];
  beforeEach(() => {
    for (let w = 8; w < 50; w += 8) {
      for (let h = 8; h < 50; h += 8) {
        rectangles.push([w, h]);
      }
    }
  });

  afterEach(() => {
    rectangles = [];
  });

  test('Packer APIs', () => {
    const p = common(PackerBBF, 50, 50, rectangles);
    // Obtain number of bins used for packing
    const nbins = p.numberOfBins;
    expect(nbins).toBeGreaterThan(0);

    // Index first bin
    const abin = p.getBin(0);
    expect(abin).toBeInstanceOf(PackingAlgorithm);

    // Bin dimensions (bins can be reordered during packing)
    const { width: binWidth, height: binHeight } = abin;
    expect(binWidth).toEqual(50);
    expect(binHeight).toEqual(50);

    // Number of rectangles packed into the first bin
    const nrect = abin.numberOfRectangles;
    expect(nrect).toEqual(9);

    // Second bin's rectangles
    const rect = p.getBin(1).rectangles;
    expect(rect).toBeInstanceOf(Array);

    // Rectangle properties
    const { x, y, width, height, rid } = rect[0];
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
    expect(rid).toBeNull();

    // for (const bin of p.binList()) {
    //   for (const rect of bin.rectangles) {
    //     console.log(rect);
    //   }
    // }

    expect(p.binList()).toBeInstanceOf(Array);
    expect(p.rectList()).toBeInstanceOf(Array);
  });

  test('BNF Big enough', () => {
    const p = common(PackerBNF, 50, 50, rectangles);
    p.validatePacking();
    expect(p.numberOfBins).toBeGreaterThan(0);
    expect(p.rectList().length).toEqual(rectangles.length);
  });

  test('BNF small enough', () => {
    const p = common(PackerBNF, 5, 5, rectangles);
    expect(p.rectList()).toEqual([]);
  });

  test('BFF Big enough', () => {
    const p = common(PackerBFF, 50, 50, rectangles);
    p.validatePacking();
    expect(p.numberOfBins).toBeGreaterThan(0);
    expect(p.rectList().length).toEqual(rectangles.length);
  });

  test('BFF small enough', () => {
    const p = common(PackerBFF, 5, 5, rectangles);
    expect(p.rectList()).toEqual([]);
  });

  test('BBF Big enough', () => {
    const p = common(PackerBBF, 50, 50, rectangles);
    p.validatePacking();
    expect(p.numberOfBins).toBeGreaterThan(0);
    expect(p.rectList().length).toEqual(rectangles.length);
  });

  test('BBF small enough', () => {
    const p = common(PackerBBF, 5, 5, rectangles);
    expect(p.rectList()).toEqual([]);
  });
});
