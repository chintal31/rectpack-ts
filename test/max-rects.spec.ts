import { MaxRects } from '@src/max-rects';
import { Rectangle } from '@src/geometry';

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

  // test('iter', () => {
  //   const m = new MaxRects(100, 100);
  //   expect(m.addRect(10, 15)).not.toBeNull();
  //   expect(m.addRect(40, 40)).not.toBeNull();

  //   const rectangles = [];
  //   for (const r of m) {
  //     rectangles.push(r);
  //   }

  //   expect(rectangles).toContainEqual(new Rectangle(0, 0, 10, 15));
  //   expect(rectangles).toContainEqual(new Rectangle(10, 0, 40, 40));
  //   expect(rectangles.length).toBe(2);
  // });

  test('fitness', () => {
    const mr = new MaxRects(100, 200, true);
    const m = new MaxRects(100, 200, false);
    expect(m.fitness(200, 100)).toBeNull();
    expect(mr.fitness(200, 100)).toBe(0);
    expect(m.fitness(100, 100)).toBe(0);
  });

  test('getitem', () => {
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
    const m = new MaxRects(100, 100, false);
    expect(m.addRect(40, 40)).toEqual(new Rectangle(0, 0, 40, 40));
    expect(m.addRect(100, 100)).toBeNull();
    expect(m.addRect(20, 20)).toEqual(new Rectangle(40, 0, 20, 20));
    expect(m.addRect(60, 40)).toEqual(new Rectangle(40, 20, 60, 40));
  });
});
