import { Rectangle } from './geometry';
import { PackingAlgorithm } from './packing-algorithm';

class MaxRects extends PackingAlgorithm {
  protected _maxRects: Rectangle[];

  constructor(width: number, height: number, rot = true) {
    super(width, height, rot);
    this._maxRects = [new Rectangle(0, 0, width, height)];
  }

  protected _rectFitness(maxRect: Rectangle, width: number, height: number): number | null {
    if (!maxRect) {
      return null;
    }
    if (width <= maxRect.width && height <= maxRect.height) {
      return 0;
    }
    return null;
  }

  protected _selectPosition(w: number, h: number): [Rectangle | null, Rectangle | null] {
    if (!this._maxRects.length) {
      return [null, null];
    }

    const fitn = this._maxRects
      .map((m) => [this._rectFitness(m, w, h), w, h, m] as [number | null, number, number, Rectangle])
      .filter((f) => f[0] !== null);

    const fitr = this.rot
      ? this._maxRects.map((m) => [this._rectFitness(m, h, w), h, w, m] as [number | null, number, number, Rectangle]).filter((f) => f[0] !== null)
      : [];

    const fit = [...fitn, ...fitr];

    if (!fit.length) {
      return [null, null];
    }

    const [, width, height, maxRect] = fit.sort((a, b) => a[0]! - b[0]!)[0];
    return [new Rectangle(maxRect.x, maxRect.y, width, height), maxRect];
  }

  generateSplits(m: Rectangle, r: Rectangle): Rectangle[] {
    const newRects: Rectangle[] = [];
    if (r.left > m.left) {
      newRects.push(new Rectangle(m.left, m.bottom, r.left - m.left, m.height));
    }
    if (r.right < m.right) {
      newRects.push(new Rectangle(r.right, m.bottom, m.right - r.right, m.height));
    }
    if (r.top < m.top) {
      newRects.push(new Rectangle(m.left, r.top, m.width, m.top - r.top));
    }
    if (r.bottom > m.bottom) {
      newRects.push(new Rectangle(m.left, m.bottom, m.width, r.bottom - m.bottom));
    }
    return newRects;
  }

  split(rect: Rectangle): void {
    const maxRects: Rectangle[] = [];

    for (const r of this._maxRects) {
      if (r.intersects(rect)) {
        maxRects.push(...this.generateSplits(r, rect));
      } else {
        maxRects.push(r);
      }
    }
    this._maxRects = maxRects;
  }

  removeDuplicates(): void {
    const contained = new Set<Rectangle>();
    for (const [m1, m2] of this.combinations(this._maxRects, 2)) {
      if (m1.contains(m2)) {
        contained.add(m2);
      } else if (m2.contains(m1)) {
        contained.add(m1);
      }
    }
    this._maxRects = this._maxRects.filter((m) => !contained.has(m));
  }

  *combinations<T>(arr: T[], r: number): Generator<T[], void, void> {
    const n = arr.length;
    if (r > n) {
      return;
    }

    // Initialize combination indices array
    const indices = [...Array(r).keys()];

    while (indices[0] <= n - r) {
      yield indices.map((i) => arr[i]);

      // Generate next combination indices
      let i = r - 1;
      while (i >= 0 && indices[i] === i + n - r) {
        i--;
      }
      if (i < 0) {
        break;
      }
      indices[i]++;
      for (let j = i + 1; j < r; j++) {
        indices[j] = indices[j - 1] + 1;
      }
    }
  }

  fitness(width: number, height: number): number | null {
    const [rect, maxRect] = this._selectPosition(width, height);
    if (!rect) {
      return null;
    }
    return this._rectFitness(maxRect, rect.width, rect.height);
  }

  addRect(width: number, height: number, rid?: any): Rectangle | null {
    const [rect, _] = this._selectPosition(width, height);

    if (!rect) {
      return null;
    }
    this.split(rect);
    this.removeDuplicates();
    rect.rid = rid;
    this.rectangles.push(rect);
    return rect;
  }

  reset(): void {
    super.reset();
    this._maxRects = [new Rectangle(0, 0, this.width, this.height)];
  }
}

class MaxRectsBl extends MaxRects {
  protected _selectPosition(w: number, h: number): [Rectangle | null, Rectangle | null] {
    const fitn = this._maxRects
      .map((m) => [m.y + h, m.x, w, h, m] as [number, number, number, number, Rectangle])
      .filter(([fitness, , , , m]) => this._rectFitness(m, w, h) !== null);

    const fitr = this.rot
      ? this._maxRects
          .map((m) => [m.y + w, m.x, h, w, m] as [number, number, number, number, Rectangle])
          .filter(([fitness, , , , m]) => this._rectFitness(m, h, w) !== null)
      : [];

    const fit = [...fitn, ...fitr];

    if (!fit.length) {
      return [null, null];
    }

    const [, , width, height, maxRect] = fit.sort((a, b) => a[0] - b[0])[0];
    return [new Rectangle(maxRect.x, maxRect.y, width, height), maxRect];
  }
}

class MaxRectsBssf extends MaxRects {
  /**
   * Best Short Side Fit minimize short leftover side
   */
  _rectFitness(maxRect: Rectangle, width: number, height: number): number | null {
    if (width > maxRect.width || height > maxRect.height) {
      return null;
    }
    return Math.min(maxRect.width - width, maxRect.height - height);
  }
}

class MaxRectsBaf extends MaxRects {
  /**
   * Best Area Fit pick maximal rectangle with smallest area
   * where the rectangle can be placed
   */
  _rectFitness(maxRect: Rectangle, width: number, height: number): number | null {
    if (width > maxRect.width || height > maxRect.height) {
      return null;
    }
    return maxRect.width * maxRect.height - width * height;
  }
}

class MaxRectsBlsf extends MaxRects {
  /**
   * Best Long Side Fit minimize long leftover side
   */
  _rectFitness(maxRect: Rectangle, width: number, height: number): number | null {
    if (width > maxRect.width || height > maxRect.height) {
      return null;
    }
    return Math.max(maxRect.width - width, maxRect.height - height);
  }
}

export { MaxRects, MaxRectsBl, MaxRectsBssf, MaxRectsBaf, MaxRectsBlsf };
