import { Rectangle } from '@src/geometry';
import { MaxRects, MaxRectsBl } from '@src/max-rects';

abstract class PackingAlgorithm {
  width: number;
  height: number;
  rot: boolean;
  rectangles: Rectangle[];
  bid?: string | number;
  _surface: Rectangle;

  constructor(width: number, height: number, rot = true, bid = null) {
    this.width = width;
    this.height = height;
    this.rot = rot;
    this.rectangles = [];
    this.bid = bid;
    this._surface = new Rectangle(0, 0, width, height);
    this.reset();
  }

  get numberOfRectangles(): number {
    return this.rectangles.length;
  }

  _fitsSurface(width: number, height: number): boolean {
    if (this.rot && (width > this.width || height > this.height)) {
      [width, height] = [height, width];
    }
    return width <= this.width && height <= this.height;
  }

  get usedArea(): number {
    return this.rectangles.reduce((acc, rect) => acc + rect.area(), 0);
  }

  abstract fitness(width: number, height: number, rot?: boolean): number | null;

  abstract addRect(width: number, height: number, rid?: any): Rectangle | null;

  rectList(): [number, number, number, number, any][] {
    return this.rectangles.map((rect) => [rect.x, rect.y, rect.width, rect.height, rect.rid]);
  }

  validatePacking(): void {
    const surface = new Rectangle(0, 0, this.width, this.height);
    for (const rect of this.rectangles) {
      if (!surface.contains(rect)) {
        throw new Error('Rectangle placed outside surface');
      }
    }
    const rects = this.rectangles;
    for (let i = 0; i < rects.length - 1; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        if (rects[i].intersects(rects[j])) {
          throw new Error('Rectangle collision detected');
        }
      }
    }
  }

  isEmpty(): boolean {
    return this.rectangles.length === 0;
  }

  reset(): void {
    this.rectangles = [];
  }
}

type PackingAlgorithms = MaxRectsBl | MaxRects;

type PackingAlgorithmInstance = new (...args: any[]) => PackingAlgorithms;

export { PackingAlgorithm, PackingAlgorithms, PackingAlgorithmInstance };