import { PackerBNF, PackerBFF, PackerBBF } from '@src/packer-mixins';
import { MaxRectsBaf, MaxRectsBl, MaxRectsBssf } from '@src/max-rects';
import { SORT_AREA, SORT_NONE } from '@src/sorting';
import { Rectangle } from '@src/geometry';

describe('TestPacker', () => {
  test('init', () => {
    // Test rotation is enabled by default
    let p = new PackerBNF();
    p.addBin(100, 10);
    p.addRect(10, 89);
    p.pack();
    expect(p.rectList()[0]).toEqual({ binIndex: 0, x: 0, y: 0, width: 89, height: 10, rid: null });

    // Test default packing algo
    p = new PackerBFF();
    p.addBin(10, 10);
    p.addRect(1, 1);
    p.pack();
    for (let b of p) {
      expect(b).toBeInstanceOf(MaxRectsBssf);
    }

    // Test default sorting algo is unsorted
    p = new PackerBFF({ rotation: false });
    p.addBin(100, 100, 20);

    p.addRect(70, 70);
    p.addRect(90, 55);
    p.addRect(90, 90);
    p.addRect(55, 90);
    p.addRect(60, 60);
    p.pack();

    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 70, height: 70, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 90, height: 55, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 2, x: 0, y: 0, width: 90, height: 90, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 3, x: 0, y: 0, width: 55, height: 90, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 4, x: 0, y: 0, width: 60, height: 60, rid: null });

    // Test custom packing algo is stored and used
    p = new PackerBFF({ packAlgo: MaxRectsBl });
    p.addBin(10, 10);
    p.addRect(1, 1);
    p.pack();
    for (let b of p) {
      expect(b).toBeInstanceOf(MaxRectsBl);
    }

    // check custom sorting algo is used
    p = new PackerBFF({
      sortAlgo: SORT_AREA,
      rotation: false,
    });
    p.addBin(100, 100, 300);
    p.addRect(60, 70);
    p.addRect(90, 80);
    p.addRect(60, 55);
    p.addRect(70, 90);
    p.pack();
    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 90, height: 80, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 70, height: 90, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 2, x: 0, y: 0, width: 60, height: 70, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 3, x: 0, y: 0, width: 60, height: 55, rid: null });

    // check rectangle rotation can be disabled
    p = new PackerBFF({
      sortAlgo: SORT_AREA,
      packAlgo: MaxRectsBaf,
      rotation: false,
    });
    p.addBin(90, 20);
    p.addRect(20, 90);
    p.pack();

    expect(p.rectList().length).toBe(0);

    p = new PackerBFF({
      sortAlgo: SORT_AREA,
      packAlgo: MaxRectsBl,
      rotation: true,
    });
    p.addBin(90, 20);
    p.addRect(20, 90);
    p.pack();

    expect(p.rectList().length).toBe(1);
  });

  test('numberOfBins', () => {
    let p = new PackerBNF();
    p.addBin(50, 50, 2);
    p.addBin(100, 100, Infinity);

    p.addRect(40, 40);
    p.addRect(91, 91);
    p.addRect(41, 41);
    p.addRect(10, 10); // can't be packed in first bin because it's closed
    p.pack();
    expect(p.numberOfBins).toEqual(4);

    // test the same with BFF mode (where bins aren't closed)
    p = new PackerBFF();
    p.addBin(50, 50, 2);
    p.addBin(100, 100, Infinity);

    p.addRect(40, 40);
    p.addRect(91, 91);
    p.addRect(41, 41);
    p.addRect(10, 10); // packed into the first bin
    p.pack();
    expect(p.numberOfBins).toEqual(3);
  });

  test('pack', () => {
    // check packing without bins doesn't raise errors
    let p = new PackerBFF();
    p.addRect(10, 10);
    p.pack();

    expect(p.rectList()).toEqual([]);
    expect(p.binList()).toEqual([]);
    expect(p.numberOfBins).toEqual(0);

    // no errors when there are no rectangles to pack
    p = new PackerBFF();
    p.addBin(10, 10);
    p.pack();
    expect(p.rectList()).toEqual([]);
    expect(p.binList()).toEqual([]);

    // Test rectangles are packed into the first available bin
    p = new PackerBFF({ rotation: false, sortAlgo: SORT_NONE });
    p.addBin(20, 10);
    p.addBin(50, 50);
    p.addRect(10, 20);
    p.addRect(41, 41); // Not enough space for this rectangle
    p.pack();

    expect(p.binList().length).toBe(1);
    expect(p.binList()[0].width).toBe(50);
    expect(p.binList()[0].height).toBe(50);
    expect(p.rectList()[0]).toEqual({ binIndex: 0, x: 0, y: 0, width: 10, height: 20, rid: null });

    // Test rectangles too big
    p = new PackerBFF();
    p.addBin(30, 30);
    p.addRect(40, 50);
    p.pack();
    expect(p.binList().length).toBe(0);
    expect(p.rectList().length).toBe(0);

    // check nothing is packed before calling pack
    p = new PackerBFF();
    p.addBin(10, 10);
    p.addRect(3, 3);

    expect(p.binList().length).toBe(0);
    expect(p.rectList().length).toBe(0);

    // Test repacking after adding more rectangles and bins
    p = new PackerBFF({ sortAlgo: SORT_NONE });
    p.addBin(100, 100);
    p.addRect(3, 3);
    p.pack();

    expect(p.binList().length).toBe(1);
    expect(p.rectList().length).toBe(1);

    p.addRect(10, 10);
    p.addRect(120, 100);
    p.addBin(200, 200);
    p.pack();

    expect(p.binList().length).toBe(2);
    expect(p.rectList().length).toBe(3);
    expect(p.rectList()[0]).toEqual({ binIndex: 0, x: 0, y: 0, width: 3, height: 3, rid: null });
    expect(p.rectList()[1]).toEqual({ binIndex: 0, x: 3, y: 0, width: 10, height: 10, rid: null });
    expect(p.rectList()[2]).toEqual({ binIndex: 1, x: 0, y: 0, width: 120, height: 100, rid: null });

    const binListRectangles = p.rectList().map((r) => new Rectangle(r.x, r.y, r.width, r.height, r.rid));
    expect(p.binList()[0]).toEqual({ width: 100, height: 100, numberOfRectangles: 2, rectangles: [binListRectangles[0], binListRectangles[1]] });
    expect(p.binList()[1]).toEqual({ width: 200, height: 200, numberOfRectangles: 1, rectangles: [binListRectangles[2]] });
  });

  test('repack', () => {
    // Test it is possible to add more rectangles/bins and pack again
    let p = new PackerBFF({ rotation: false, sortAlgo: SORT_NONE });
    p.addBin(50, 50);
    p.addRect(20, 20);
    p.pack();

    expect(p.rectList().length).toBe(1);
    expect(p.binList().length).toBe(1);

    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 20, height: 20, rid: null });

    // Add more rectangles and re-pack
    p.addRect(10, 10);
    p.addRect(70, 50);
    p.pack();
    expect(p.rectList().length).toBe(2);
    expect(p.binList().length).toBe(1);

    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 20, height: 20, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 20, y: 0, width: 10, height: 10, rid: null });

    // Add more bins and re-pack
    p.addBin(70, 70);
    p.addBin(100, 100);
    p.pack();
    expect(p.rectList().length).toBe(3);
    expect(p.binList().length).toBe(2);
    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 20, height: 20, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 20, y: 0, width: 10, height: 10, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 70, height: 50, rid: null });

    // check rectangles are sorted before a repack
    p = new PackerBNF({ rotation: false, sortAlgo: SORT_AREA });
    p.addBin(100, 100);
    p.addBin(90, 90);
    p.addBin(80, 80);

    p.addRect(70, 70);
    p.addRect(80, 80);
    p.pack();

    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 80, height: 80, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 70, height: 70, rid: null });

    // add bigger rectangle and repack
    p.addRect(90, 90);
    p.pack();

    expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 90, height: 90, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 80, height: 80, rid: null });
    expect(p.rectList()).toContainEqual({ binIndex: 2, x: 0, y: 0, width: 70, height: 70, rid: null });
  });

  describe('PackerBNF', () => {
    test('bin selection', () => {
      // Test bins are closed after one failed packing attempt
      const p = new PackerBNF({ packAlgo: MaxRectsBaf, sortAlgo: SORT_NONE, rotation: false });
      p.addBin(50, 50, 100);
      p.addBin(100, 100);
      p.addBin(300, 300, 100);

      p.addRect(40, 40);
      p.addRect(90, 90);
      p.addRect(5, 5);
      p.addRect(20, 20);
      p.addRect(10, 10);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 40, height: 40, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 90, height: 90, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 90, y: 0, width: 5, height: 5, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 2, x: 0, y: 0, width: 20, height: 20, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 2, x: 20, y: 0, width: 10, height: 10, rid: null });

      expect(p.binList().length).toBe(3);
      expect(p.binList()[0].width).toBe(50);
      expect(p.binList()[1].width).toBe(100);
      expect(p.binList()[2].width).toBe(50);
    });

    test('repack', () => {
      // Test it is possible to add more rectangles/bins and pack again
      const p = new PackerBNF({ sortAlgo: SORT_NONE, rotation: false });
      p.addBin(100, 100);
      p.addRect(20, 20);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 20, height: 20, rid: null });

      // Add rectangles and repack
      p.addRect(80, 80);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 20, height: 20, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 20, y: 0, width: 80, height: 80, rid: null });
    });

    test('repack rectangle sort', () => {
      // check rectangles are sorted before a repack
      const p = new PackerBNF({ rotation: false, sortAlgo: SORT_AREA });
      p.addBin(100, 100);
      p.addBin(90, 90);
      p.addBin(80, 80);

      p.addRect(70, 70);
      p.addRect(80, 80);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 80, height: 80, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 70, height: 70, rid: null });

      // add bigger rectangle and repack
      p.addRect(90, 90);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 90, height: 90, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 80, height: 80, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 2, x: 0, y: 0, width: 70, height: 70, rid: null });
    });
  });

  describe('PackerBFF', () => {
    test('bin selection', () => {
      // check rectangle is packed into the first open bin where it fits,
      // if it can't be packed into any use the first available bin
      const p = new PackerBFF({ packAlgo: MaxRectsBaf, rotation: false });
      p.addBin(20, 20, 2);
      p.addBin(100, 100);

      // Packed into second bin
      p.addRect(90, 90);
      p.pack();
      expect(p.binList().length).toBe(1);
      expect(p.binList()[0].width).toBe(100);

      // rectangles are packed into open bins whenever possible
      p.addRect(10, 10);
      p.pack();
      expect(p.binList().length).toBe(1);
      expect(p.rectList().length).toBe(2);

      p.addRect(5, 5);
      p.pack();
      expect(p.binList().length).toBe(1);
      expect(p.rectList().length).toBe(3);

      // rectangle doesn't fit, open new bin
      p.addRect(15, 15);
      p.pack();
      expect(p.binList().length).toBe(2);
      expect(p.rectList().length).toBe(4);

      // if there are more than one possible bin select first one
      p.addRect(5, 5);
      p.pack();
      expect(p.binList().length).toBe(2);
      expect(p.rectList().length).toBe(5);

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 90, y: 10, width: 5, height: 5, rid: null });
    });
  });

  describe('PackerBBF', () => {
    test('PackerBBF bin selection', () => {
      // Check rectangles are packed into the bin with the best fitness score.
      // In this case, the one wasting less area.
      const p = new PackerBBF({ packAlgo: MaxRectsBaf, rotation: false });
      p.addBin(10, 10);
      p.addBin(15, 15);
      p.addBin(55, 55);
      p.addBin(50, 50);

      // First rectangle is packed into the first bin where it fits
      p.addRect(50, 30);
      p.pack();
      expect(p.binList().length).toBe(1);
      expect(p.binList()[0].width).toBe(55);

      // Another bin is opened when it doesn't fit into the first one
      p.addRect(50, 30);
      p.pack();
      expect(p.binList().length).toBe(2);
      expect(p.binList()[1].width).toBe(50);

      // Rectangle is placed into the bin with the best fitness, not the first one where it fits.
      p.addRect(20, 20);
      p.pack();
      expect(p.binList().length).toBe(2);

      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 30, width: 20, height: 20, rid: null });
    });

    test('repack rectangle sort', () => {
      // Check rectangles are sorted before a repack
      const p = new PackerBBF({ rotation: false, sortAlgo: SORT_AREA });
      p.addBin(100, 100);
      p.addBin(90, 90);
      p.addBin(80, 80);

      p.addRect(70, 70);
      p.addRect(80, 80);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 80, height: 80, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 70, height: 70, rid: null });

      // Add a bigger rectangle and repack
      p.addRect(90, 90);
      p.pack();

      expect(p.rectList()).toContainEqual({ binIndex: 0, x: 0, y: 0, width: 90, height: 90, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 1, x: 0, y: 0, width: 80, height: 80, rid: null });
      expect(p.rectList()).toContainEqual({ binIndex: 2, x: 0, y: 0, width: 70, height: 70, rid: null });
    });
  });
});
