import { Point, Rectangle } from '@src/geometry';

describe('Point', () => {
  it('should initialize correctly', () => {
    const p = new Point(1, 2);
    expect(p.x).toBe(1);
    expect(p.y).toBe(2);
  });

  it('should test equality correctly', () => {
    const p1 = new Point(3, 4);
    const p2 = new Point(3, 4);
    const p3 = new Point(4, 3);

    expect(p1.equals(p2)).toBe(true);
    expect(p1.equals(p3)).toBe(false);
    expect(p2.equals(p3)).toBe(false);
  });

  it('should calculate distance correctly', () => {
    const p1 = new Point(1, 1);
    const p2 = new Point(2, 1);

    expect(p1.distance(p2)).toBe(1);
  });
});

describe('Rectangle', () => {
  it('should initialize correctly', () => {
    const r = new Rectangle(1, 2, 3, 4);
    expect(r.left).toBe(1);
    expect(r.bottom).toBe(2);
    expect(r.right).toBe(4);
    expect(r.top).toBe(6);
    expect(r.width).toBe(3);
    expect(r.height).toBe(4);

    expect(r.cornerTopL.equals(new Point(1, 6))).toBe(true);
    expect(r.cornerTopR.equals(new Point(4, 6))).toBe(true);
    expect(r.cornerBotL.equals(new Point(1, 2))).toBe(true);
    expect(r.cornerBotR.equals(new Point(4, 2))).toBe(true);
  });

  it('should evaluate to true', () => {
    const r = new Rectangle(1, 2, 3, 4);
    expect(r).toBeTruthy();
  });

  it('should move correctly', () => {
    const r = new Rectangle(1, 2, 2, 2);
    expect(r.bottom).toBe(2);
    expect(r.left).toBe(1);

    r.move(10, 12);
    expect(r.bottom).toBe(12);
    expect(r.left).toBe(10);
    expect(r.top).toBe(14);
    expect(r.right).toBe(12);
    expect(r.height).toBe(2);
    expect(r.width).toBe(2);

    expect(r.cornerTopL.equals(new Point(10, 14))).toBe(true);
    expect(r.cornerTopR.equals(new Point(12, 14))).toBe(true);
    expect(r.cornerBotL.equals(new Point(10, 12))).toBe(true);
    expect(r.cornerBotR.equals(new Point(12, 12))).toBe(true);
  });

  it('should calculate area correctly', () => {
    const r1 = new Rectangle(0, 0, 1, 2);
    const r2 = new Rectangle(1, 1, 2, 3);

    expect(r1.area()).toBe(2);
    expect(r2.area()).toBe(6);
  });

  it('should test equality correctly', () => {
    const r1 = new Rectangle(0, 0, 1, 2);
    const r2 = new Rectangle(0, 0, 1, 1);
    const r3 = new Rectangle(1, 1, 1, 2);

    expect(r1.equals(r3)).toBe(false);
    expect(r1.equals(r2)).toBe(false);
    expect(r2.equals(r3)).toBe(false);

    const r4 = new Rectangle(0, 0, 1, 2);
    expect(r1.equals(r4)).toBe(true);

    const r5 = new Rectangle(1, 1, 1, 2);
    expect(r3.equals(r5)).toBe(true);
  });

  it('should compare correctly using less than', () => {
    const r1 = new Rectangle(0, 0, 2, 1);
    const r2 = new Rectangle(0, 0, 1, 2);
    const r3 = new Rectangle(0, 0, 1, 3);

    expect(r1.area() < r2.area()).toBe(false);
    expect(r1.area() < r3.area()).toBe(true);
    expect(r2.area() < r3.area()).toBe(true);
  });

  it('should be hashable', () => {
    const r = new Rectangle(1, 1, 1, 1);
    const map = new Map<Rectangle, number>();
    map.set(r, 43);

    expect(map.get(r)).toBe(43);
  });

  it('should test intersection correctly', () => {
    // No intersections
    const r = new Rectangle(20, 20, 4, 4);
    const r1 = new Rectangle(30, 30, 1, 1);
    const r2 = new Rectangle(20, 40, 2, 2);
    const r3 = new Rectangle(10, 10, 2, 2);

    expect(r.intersects(r1)).toBe(false);
    expect(r.intersects(r2)).toBe(false);
    expect(r.intersects(r3)).toBe(false);

    // Full contained intersects
    const r4 = new Rectangle(21, 21, 2, 2);
    const r5 = new Rectangle(18, 18, 8, 8);
    expect(r.intersects(r4)).toBe(true);
    expect(r.intersects(r5)).toBe(true);

    // Area intersects
    const r6 = new Rectangle(10, 10, 2, 2);
    const r_top = new Rectangle(10, 11, 2, 2);
    const r_bottom = new Rectangle(10, 9, 2, 2);
    const r_right = new Rectangle(11, 10, 2, 2);
    const r_left = new Rectangle(9, 10, 2, 2);

    expect(r6.intersects(r_top)).toBe(true);
    expect(r6.intersects(r_bottom)).toBe(true);
    expect(r6.intersects(r_right)).toBe(true);
    expect(r6.intersects(r_left)).toBe(true);
  });

  it('should find intersection correctly', () => {
    const r1 = new Rectangle(0, 0, 2, 2);
    const r2 = new Rectangle(1, 1, 2, 2);

    const r3 = r1.intersection(r2);
    if (r3) {
      expect(r3.equals(new Rectangle(1, 1, 1, 1))).toBe(true);
    } else {
      fail('Expected an intersection');
    }

    const r4 = new Rectangle(3, 3, 2, 2);
    const r5 = r1.intersection(r4);
    expect(r5).toBeNull();
  });

  it('should test containing correctly', () => {
    const r = new Rectangle(0, 0, 4, 4);

    const r1 = new Rectangle(1, 1, 2, 2);
    expect(r.contains(r1)).toBe(true);

    const r2 = new Rectangle(-1, -1, 2, 2);
    expect(r.contains(r2)).toBe(false);

    const r3 = new Rectangle(3, 3, 2, 2);
    expect(r.contains(r3)).toBe(false);

    const r4 = new Rectangle(3, 3, 1, 1);
    expect(r.contains(r4)).toBe(true);
  });

  it('should join rectangles correctly', () => {
    const r1 = new Rectangle(0, 0, 1, 2);
    const r2 = new Rectangle(1, 0, 2, 2);

    expect(r1.join(r2)).toBe(true);
    expect(r1.equals(new Rectangle(0, 0, 3, 2))).toBe(true);

    const r3 = new Rectangle(0, 0, 1, 2);
    const r4 = new Rectangle(0, 2, 1, 2);

    expect(r3.join(r4)).toBe(true);
    expect(r3.equals(new Rectangle(0, 0, 1, 4))).toBe(true);
  });
});
