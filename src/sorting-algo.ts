import { Rectangle } from '@src/geometry';

const SORT_AREA = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((r1, r2) => r2[0] * r2[1] - r1[0] * r1[1]); // Sort by area
};

const SORT_PERI = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((a, b) => b[0] + b[1] - (a[0] + a[1])); // Sort by perimeter
};

const SORT_DIFF = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((a, b) => Math.abs(b[0] - b[1]) - Math.abs(a[0] - a[1])); // Sort by difference
};

const SORT_SSIDE = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((a, b) => {
    const minA = Math.min(a[0], a[1]);
    const minB = Math.min(b[0], b[1]);
    if (minB !== minA) {
      return minB - minA;
    }
    return Math.max(b[0], b[1]) - Math.max(a[0], a[1]);
  }); // Sort by short side
};

const SORT_LSIDE = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((a, b) => {
    const maxA = Math.max(a[0], a[1]);
    const maxB = Math.max(b[0], b[1]);
    if (maxB !== maxA) {
      return maxB - maxA;
    }
    return Math.min(b[0], b[1]) - Math.min(a[0], a[1]);
  }); // Sort by long side
};

const SORT_RATIO = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((a, b) => b[0] / b[1] - a[0] / a[1]); // Sort by side ratio
};

const SORT_NONE = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist; // Unsorted
};

type Sorting = {
  area: typeof SORT_AREA;
  perimeter: typeof SORT_PERI;
  diff: typeof SORT_DIFF;
  shortSide: typeof SORT_SSIDE;
  longSide: typeof SORT_LSIDE;
  ratio: typeof SORT_RATIO;
  none: typeof SORT_NONE;
};

export { Sorting, SORT_AREA, SORT_PERI, SORT_DIFF, SORT_SSIDE, SORT_LSIDE, SORT_RATIO, SORT_NONE };
