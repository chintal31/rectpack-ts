import { Sorting, PackerRect } from '@src/types';

const SORT_AREA = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist.sort((r1, r2) => r2[0] * r2[1] - r1[0] * r1[1]); // Sort by area
};

const SORT_PERI = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist.sort((a, b) => b[0] + b[1] - (a[0] + a[1])); // Sort by perimeter
};

const SORT_DIFF = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist.sort((a, b) => Math.abs(b[0] - b[1]) - Math.abs(a[0] - a[1])); // Sort by difference
};

const SORT_SSIDE = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist.sort((a, b) => {
    const minA = Math.min(a[0], a[1]);
    const minB = Math.min(b[0], b[1]);
    if (minB !== minA) {
      return minB - minA;
    }
    return Math.max(b[0], b[1]) - Math.max(a[0], a[1]);
  }); // Sort by short side
};

const SORT_LSIDE = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist.sort((a, b) => {
    const maxA = Math.max(a[0], a[1]);
    const maxB = Math.max(b[0], b[1]);
    if (maxB !== maxA) {
      return maxB - maxA;
    }
    return Math.min(b[0], b[1]) - Math.min(a[0], a[1]);
  }); // Sort by long side
};

const SORT_RATIO = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist.sort((a, b) => b[0] / b[1] - a[0] / a[1]); // Sort by side ratio
};

const SORT_NONE = (rectlist: PackerRect[]): PackerRect[] => {
  return rectlist; // Unsorted
};

export { Sorting, SORT_AREA, SORT_PERI, SORT_DIFF, SORT_SSIDE, SORT_LSIDE, SORT_RATIO, SORT_NONE };
