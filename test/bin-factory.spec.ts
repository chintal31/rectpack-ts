import { PackageBin, Packer, PackerBBF, PackerBFF, PackerBNF } from '@src/packer';

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
