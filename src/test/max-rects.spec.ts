import { MaxRects, MaxRectsBaf, MaxRectsBl, MaxRectsBlsf, MaxRectsBssf } from '../max-rects';
import { Rectangle } from '../geometry';

describe('MaxRects', () => {
  test('init', () => {
    const m = new MaxRects(20, 50);
    expect(m['_maxRects'][0]).toEqual(new Rectangle(0, 0, 20, 50));
    expect(m.width).toBe(20);
    expect(m.height).toBe(50);
  });

  test('reset', () => {
    const m = new MaxRects(100, 200);
    expect(m.addRect(30, 30)).not.toBeNull();
    expect(m.addRect(50, 50)).not.toBeNull();
    expect(m.rectangles.length).toBe(2);

    m.reset();
    expect(m.rectangles.length).toBe(0);
    expect(m['_maxRects'].length).toBe(1);
    expect(m.rectangles.length).toBe(0);
    expect(m['_maxRects'][0]).toEqual(new Rectangle(0, 0, 100, 200));
  });

  test('addRect', () => {
    const m = new MaxRects(200, 100);
    expect(m.addRect(50, 30)).toEqual(new Rectangle(0, 0, 50, 30));
    expect(m['_maxRects'].length).toBe(2);
    expect(m.addRect(70, 200)).toEqual(new Rectangle(0, 30, 200, 70));
    expect(m['_maxRects'].length).toBe(1);
    expect(m.addRect(20, 20)).toEqual(new Rectangle(50, 0, 20, 20));
    expect(m['_maxRects'].length).toBe(2);
    expect(m.addRect(50, 50)).toBeNull();
    expect(m.addRect(30, 100)).toEqual(new Rectangle(70, 0, 100, 30));

    const mNoRot = new MaxRects(200, 50, false);
    expect(mNoRot.addRect(40, 80)).toBeNull();

    const mWithRot = new MaxRects(200, 50, true);
    expect(mWithRot.addRect(40, 80)).toEqual(new Rectangle(0, 0, 80, 40));
  });

  test('removeDuplicates', () => {
    const m = new MaxRects(100, 100);
    const rect1 = new Rectangle(0, 0, 60, 40);
    const rect2 = new Rectangle(30, 20, 60, 40);
    const rect3 = new Rectangle(35, 25, 10, 10);
    const rect4 = new Rectangle(90, 90, 10, 10);
    m['_maxRects'] = [rect1, rect2, rect3, rect4];

    m.removeDuplicates();
    expect(m['_maxRects']).toContain(rect1);
    expect(m['_maxRects']).toContain(rect2);
    expect(m['_maxRects']).toContain(rect4);
    expect(m['_maxRects'].length).toBe(3);

    const mSingle = new MaxRects(100, 100);
    mSingle.removeDuplicates();
    expect(mSingle['_maxRects'].length).toBe(1);
  });

  test('iter', () => {
    const m = new MaxRects(100, 100);
    expect(m.addRect(10, 15)).not.toBeNull();
    expect(m.addRect(40, 40)).not.toBeNull();

    const rectangles: { width: number; height: number; rid?: string }[] = [];
    for (const r of m) {
      rectangles.push(r);
    }

    expect(rectangles).toContainEqual(new Rectangle(0, 0, 10, 15));
    expect(rectangles).toContainEqual(new Rectangle(10, 0, 40, 40));
    expect(rectangles.length).toBe(2);
  });

  test('fitness', () => {
    const mr = new MaxRects(100, 200, true);
    const m = new MaxRects(100, 200, false);
    expect(m.fitness(200, 100)).toBeNull();
    expect(mr.fitness(200, 100)).toBe(0);
    expect(m.fitness(100, 100)).toBe(0);
  });

  test('split', () => {
    const m = new MaxRects(100, 100);
    m.addRect(20, 20);

    expect(m['_maxRects']).toContainEqual(new Rectangle(20, 0, 80, 100));
    expect(m['_maxRects']).toContainEqual(new Rectangle(0, 20, 100, 80));
    expect(m['_maxRects']).toHaveLength(2);

    m.split(new Rectangle(20, 20, 20, 20));
    expect(m['_maxRects']).toHaveLength(6);

    m.removeDuplicates();
    expect(m['_maxRects']).toHaveLength(4);
  });

  describe('generateSplit', () => {
    let m: MaxRects;
    let mr: Rectangle;

    beforeEach(() => {
      m = new MaxRects(40, 40);
      mr = new Rectangle(20, 20, 40, 40);
    });

    test('should return an empty array for same rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(20, 20, 40, 40));
      expect(rects).toEqual([]);
    });

    test('should return an empty array for contained rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(0, 0, 80, 80));
      expect(rects).toEqual([]);
    });

    test('should return correct splits for center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(30, 30, 10, 10));
      expect(rects).toContainEqual(new Rectangle(20, 20, 10, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20)); // Top
      expect(rects.length).toBe(4);
    });

    test('should return correct splits for top-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(30, 30, 10, 30));
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(20, 20, 10, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for large top-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(30, 30, 10, 100));
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(20, 20, 10, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for bottom-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(30, 20, 10, 10));
      expect(rects).toContainEqual(new Rectangle(20, 30, 40, 30)); // Top
      expect(rects).toContainEqual(new Rectangle(20, 20, 10, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for large bottom-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(30, 0, 10, 30));
      expect(rects).toContainEqual(new Rectangle(20, 30, 40, 30)); // Top
      expect(rects).toContainEqual(new Rectangle(20, 20, 10, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for left-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(20, 30, 20, 10));
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20)); // Top
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for large left-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(0, 30, 40, 10));
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20)); // Top
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for right-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(40, 30, 20, 20));
      expect(rects).toContainEqual(new Rectangle(20, 50, 40, 10)); // Top
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(20, 20, 20, 40)); // Left
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for large right-center rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(40, 30, 90, 20));
      expect(rects).toContainEqual(new Rectangle(20, 50, 40, 10)); // Top
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 10)); // Bottom
      expect(rects).toContainEqual(new Rectangle(20, 20, 20, 40)); // Left
      expect(rects.length).toBe(3);
    });

    test('should return correct splits for top-right rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(40, 40, 20, 20));
      expect(rects).toContainEqual(new Rectangle(20, 20, 20, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 20)); // Bottom
      expect(rects.length).toBe(2);
    });

    test('should return correct splits for large top-right rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(40, 40, 30, 30));
      expect(rects).toContainEqual(new Rectangle(20, 20, 20, 40)); // Left
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 20)); // Bottom
      expect(rects.length).toBe(2);
    });

    test('should return correct splits for bottom-left rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(20, 20, 20, 20));
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20)); // Top
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(2);
    });

    test('should return correct splits for large bottom-left rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(10, 10, 30, 30));
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20)); // Top
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40)); // Right
      expect(rects.length).toBe(2);
    });

    test('should return correct splits for full top rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(20, 40, 40, 20));
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 20));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for larger full top rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(10, 40, 60, 60));
      expect(rects).toContainEqual(new Rectangle(20, 20, 40, 20));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for full bottom rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(20, 20, 40, 20));
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for larger full bottom rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(10, 10, 50, 30));
      expect(rects).toContainEqual(new Rectangle(20, 40, 40, 20));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for full right rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(40, 20, 20, 40));
      expect(rects).toContainEqual(new Rectangle(20, 20, 20, 40));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for larger full right rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(40, 10, 30, 60));
      expect(rects).toContainEqual(new Rectangle(20, 20, 20, 40));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for full left rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(20, 20, 20, 40));
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40));
      expect(rects.length).toBe(1);
    });

    test('should return correct splits for larger full left rectangle', () => {
      const rects = m.generateSplits(mr, new Rectangle(10, 10, 30, 60));
      expect(rects).toContainEqual(new Rectangle(40, 20, 20, 40));
      expect(rects.length).toBe(1);
    });
  });

  test('getBin', () => {
    const m = new MaxRects(100, 100, false);
    m.addRect(40, 40);
    m.addRect(20, 20);
    m.addRect(60, 40);

    expect(m.rectangles[0]).toEqual(new Rectangle(0, 0, 40, 40));
    expect(m.rectangles[1]).toEqual(new Rectangle(40, 0, 20, 20));
    expect(m.rectangles[2]).toEqual(new Rectangle(40, 20, 60, 40));

    expect(m.rectangles[m.rectangles.length - 1]).toEqual(new Rectangle(40, 20, 60, 40));
    expect(m.rectangles.slice(1)).toEqual([new Rectangle(40, 0, 20, 20), new Rectangle(40, 20, 60, 40)]);
  });
});

describe('MaxRectsBl', () => {
  test('selectPosition', () => {
    const m = new MaxRectsBl(100, 100, false);
    expect(m.addRect(40, 40)).toEqual(new Rectangle(0, 0, 40, 40));
    expect(m.addRect(100, 100)).toBeNull();
    expect(m.addRect(20, 20)).toEqual(new Rectangle(40, 0, 20, 20));
    expect(m.addRect(60, 40)).toEqual(new Rectangle(40, 20, 60, 40));
  });
});

describe('MaxRectsBaf', () => {
  test('_rectFitness', () => {
    const m = new MaxRectsBaf(100, 100, false);
    expect(m.addRect(60, 10)).toEqual(new Rectangle(0, 0, 60, 10));

    expect(m.fitness(40, 40)).toBeLessThan(<number>m.fitness(50, 50));
    expect(m.fitness(40, 40)).toBeLessThan(<number>m.fitness(35, 35));
    expect(m.addRect(40, 40)).toEqual(new Rectangle(60, 0, 40, 40));
  });
});

describe('MaxRectsBlsf', () => {
  test('_rectFitness', () => {
    const m = new MaxRectsBlsf(100, 100, false);
    expect(m.addRect(60, 10)).toEqual(new Rectangle(0, 0, 60, 10));

    expect(m.fitness(30, 90)).toBeLessThan(<number>m.fitness(40, 89));
    expect(m.fitness(99, 10)).toBeLessThan(<number>m.fitness(99, 5));
  });
});

describe('MaxRectsBssf', () => {
  test('_rectFitness', () => {
    const m = new MaxRectsBssf(100, 100, false);
    expect(m.addRect(60, 10)).toEqual(new Rectangle(0, 0, 60, 10));

    expect(m.fitness(30, 91)).toBeGreaterThan(<number>m.fitness(30, 92));
    expect(m.fitness(38, 91)).toBeLessThan(<number>m.fitness(30, 92));
    expect(m.fitness(38, 91)).toBeGreaterThan(<number>m.fitness(40, 92));
  });
});
