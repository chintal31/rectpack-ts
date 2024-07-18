class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  distance(point: Point): number {
    return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
  }

  distanceSquared(point: Point): number {
    return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
  }
}

class Rectangle {
  width: number;
  height: number;
  x: number;
  y: number;
  rid?: any;

  constructor(x: number, y: number, width: number, height: number, rid?: any) {
    if (height < 0 || width < 0) {
      throw new Error('Height and width must be non-negative');
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.rid = rid;
  }

  get bottom(): number {
    return this.y;
  }

  get top(): number {
    return this.y + this.height;
  }

  get left(): number {
    return this.x;
  }

  get right(): number {
    return this.x + this.width;
  }

  get cornerTopL(): Point {
    return new Point(this.left, this.top);
  }

  get cornerTopR(): Point {
    return new Point(this.right, this.top);
  }

  get cornerBotR(): Point {
    return new Point(this.right, this.bottom);
  }

  get cornerBotL(): Point {
    return new Point(this.left, this.bottom);
  }

  compareTo(other: Rectangle): boolean {
    return this.area() < other.area();
  }

  equals(other: any): boolean {
    if (!(other instanceof Rectangle)) {
      return false;
    }

    return this.width === other.width && this.height === other.height && this.x === other.x && this.y === other.y;
  }

  area(): number {
    return this.width * this.height;
  }

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  contains(rect: Rectangle): boolean {
    return rect.y >= this.y && rect.x >= this.x && rect.y + rect.height <= this.y + this.height && rect.x + rect.width <= this.x + this.width;
  }

  intersects(rect: Rectangle, edges = false): boolean {
    if (edges) {
      if (this.bottom > rect.top || this.top < rect.bottom || this.left > rect.right || this.right < rect.left) {
        return false;
      }
    } else {
      if (this.bottom >= rect.top || this.top <= rect.bottom || this.left >= rect.right || this.right <= rect.left) {
        return false;
      }
    }
    return true;
  }

  intersection(rect: Rectangle, edges = false): Rectangle | null {
    if (!this.intersects(rect, edges)) {
      return null;
    }

    const bottom = Math.max(this.bottom, rect.bottom);
    const left = Math.max(this.left, rect.left);
    const top = Math.min(this.top, rect.top);
    const right = Math.min(this.right, rect.right);

    return new Rectangle(left, bottom, right - left, top - bottom);
  }

  join(other: Rectangle): boolean {
    if (this.contains(other)) {
      return true;
    }

    if (other.contains(this)) {
      this.x = other.x;
      this.y = other.y;
      this.width = other.width;
      this.height = other.height;
      return true;
    }

    if (!this.intersects(other, true)) {
      return false;
    }

    if (this.left === other.left && this.width === other.width) {
      const yMin = Math.min(this.bottom, other.bottom);
      const yMax = Math.max(this.top, other.top);
      this.y = yMin;
      this.height = yMax - yMin;
      return true;
    }

    if (this.bottom === other.bottom && this.height === other.height) {
      const xMin = Math.min(this.left, other.left);
      const xMax = Math.max(this.right, other.right);
      this.x = xMin;
      this.width = xMax - xMin;
      return true;
    }

    return false;
  }
}

export { Point, Rectangle };
