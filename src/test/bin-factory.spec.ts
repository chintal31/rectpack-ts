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
    expect(nbins).toEqual(13);

    // Index first bin
    const abin = p.getBin(0);
    expect(abin).toBeInstanceOf(PackingAlgorithm);

    // Bin dimensions (bins can be reordered during packing)
    const { width: binWidth, height: binHeight } = abin;
    expect(binWidth).toEqual(50);
    expect(binHeight).toEqual(50);

    // Number of rectangles packed into the first bin
    const nrect = abin.numberOfRectangles;
    expect(nrect).toEqual(1);

    // Second bin's rectangles
    const bbin = p.getBin(1);
    expect(bbin.rectangles).toBeInstanceOf(Array);
    expect(bbin.numberOfRectangles).toEqual(2);

    // Rectangle properties
    const { x, y, width, height, rid } = bbin.rectangles[0];
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
    expect(rid).toBeNull();

    const expectedRectangleList = [
      { binIndex: 0, x: 0, y: 0, width: 48, height: 48, rid: null },
      { binIndex: 1, x: 0, y: 0, width: 40, height: 48, rid: null },
      { binIndex: 1, x: 40, y: 0, width: 8, height: 48, rid: null },
      { binIndex: 2, x: 0, y: 0, width: 48, height: 40, rid: null },
      { binIndex: 2, x: 0, y: 40, width: 48, height: 8, rid: null },
      { binIndex: 3, x: 0, y: 0, width: 40, height: 40, rid: null },
      { binIndex: 3, x: 40, y: 0, width: 8, height: 40, rid: null },
      { binIndex: 3, x: 0, y: 40, width: 40, height: 8, rid: null },
      { binIndex: 3, x: 40, y: 40, width: 8, height: 8, rid: null },
      { binIndex: 4, x: 0, y: 0, width: 32, height: 48, rid: null },
      { binIndex: 4, x: 32, y: 0, width: 16, height: 48, rid: null },
      { binIndex: 5, x: 0, y: 0, width: 48, height: 32, rid: null },
      { binIndex: 5, x: 0, y: 32, width: 48, height: 16, rid: null },
      { binIndex: 6, x: 0, y: 0, width: 32, height: 40, rid: null },
      { binIndex: 6, x: 32, y: 0, width: 16, height: 40, rid: null },
      { binIndex: 6, x: 0, y: 40, width: 32, height: 8, rid: null },
      { binIndex: 6, x: 32, y: 40, width: 16, height: 8, rid: null },
      { binIndex: 7, x: 0, y: 0, width: 40, height: 32, rid: null },
      { binIndex: 7, x: 0, y: 32, width: 40, height: 16, rid: null },
      { binIndex: 7, x: 40, y: 0, width: 8, height: 32, rid: null },
      { binIndex: 7, x: 40, y: 32, width: 8, height: 16, rid: null },
      { binIndex: 8, x: 0, y: 0, width: 24, height: 48, rid: null },
      { binIndex: 8, x: 24, y: 0, width: 24, height: 48, rid: null },
      { binIndex: 9, x: 0, y: 0, width: 32, height: 32, rid: null },
      { binIndex: 9, x: 32, y: 0, width: 16, height: 32, rid: null },
      { binIndex: 9, x: 0, y: 32, width: 32, height: 16, rid: null },
      { binIndex: 9, x: 32, y: 32, width: 16, height: 16, rid: null },
      { binIndex: 10, x: 0, y: 0, width: 24, height: 40, rid: null },
      { binIndex: 10, x: 24, y: 0, width: 24, height: 40, rid: null },
      { binIndex: 10, x: 0, y: 40, width: 24, height: 8, rid: null },
      { binIndex: 10, x: 24, y: 40, width: 24, height: 8, rid: null },
      { binIndex: 11, x: 0, y: 0, width: 24, height: 32, rid: null },
      { binIndex: 11, x: 24, y: 0, width: 24, height: 32, rid: null },
      { binIndex: 11, x: 0, y: 32, width: 24, height: 16, rid: null },
      { binIndex: 11, x: 24, y: 32, width: 24, height: 16, rid: null },
      { binIndex: 12, x: 0, y: 0, width: 24, height: 24, rid: null },
    ];
    expect(p.binList()).toBeInstanceOf(Array);
    expect(p.rectList()).toBeInstanceOf(Array);
    expect(p.rectList()).toEqual(expectedRectangleList);
  });

  test('BNF Big enough', () => {
    const p = common(PackerBNF, 50, 50, rectangles);
    expect(p.numberOfBins).toBeGreaterThan(0);
    expect(p.rectList().length).toEqual(rectangles.length);
  });

  test('BNF small enough', () => {
    const p = common(PackerBNF, 5, 5, rectangles);
    expect(p.rectList()).toEqual([]);
  });

  test('BFF Big enough', () => {
    const p = common(PackerBFF, 50, 50, rectangles);
    expect(p.numberOfBins).toBeGreaterThan(0);
    expect(p.rectList().length).toEqual(rectangles.length);
  });

  test('BFF small enough', () => {
    const p = common(PackerBFF, 5, 5, rectangles);
    expect(p.rectList()).toEqual([]);
  });

  test('BBF Big enough', () => {
    const p = common(PackerBBF, 50, 50, rectangles);
    expect(p.numberOfBins).toBeGreaterThan(0);
    expect(p.rectList().length).toEqual(rectangles.length);
  });

  test('BBF small enough', () => {
    const p = common(PackerBBF, 5, 5, rectangles);
    expect(p.rectList()).toEqual([]);
  });
});
