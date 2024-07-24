import { PackerRect } from '../types';
import { SORT_NONE, SORT_AREA, SORT_PERI, SORT_DIFF, SORT_SSIDE, SORT_LSIDE, SORT_RATIO } from '../sorting';

describe('Sorter Tests', () => {
  // Test for SORT_NONE
  test('should return the list as is for SORT_NONE', () => {
    const a: PackerRect[] = [
      [3, 3, null],
      [3, 1, null],
      [3, 2, null],
      [1, 2, null],
      [2, 1, null],
    ];
    const ordered = SORT_NONE(a);
    expect(ordered).toEqual(a);

    // Test empty list
    expect(SORT_NONE([])).toEqual([]);
  });

  // Test for SORT_AREA
  test('should sort rectangles by descending area', () => {
    const a: PackerRect[] = [
      [5, 5, null],
      [7, 7, null],
      [3, 4, null],
      [100, 1, null],
    ];
    const ordered = SORT_AREA(a);
    expect(ordered).toEqual([
      [100, 1, null],
      [7, 7, null],
      [5, 5, null],
      [3, 4, null],
    ]);

    // Test empty list
    expect(SORT_AREA([])).toEqual([]);
  });

  // Test for SORT_PERI
  test('should sort rectangles by perimeter', () => {
    const a: PackerRect[] = [
      [5, 5, null],
      [7, 7, null],
      [3, 4, null],
      [40, 1, null],
    ];
    const ordered = SORT_PERI(a);
    expect(ordered).toEqual([
      [40, 1, null],
      [7, 7, null],
      [5, 5, null],
      [3, 4, null],
    ]);

    // Test empty list
    expect(SORT_PERI([])).toEqual([]);
  });

  // Test for SORT_DIFF
  test('should sort rectangles by the difference in side lengths', () => {
    const a: PackerRect[] = [
      [7, 1, null],
      [1, 9, null],
      [2, 11, null],
      [5, 1, null],
    ];
    const ordered = SORT_DIFF(a);
    expect(ordered).toEqual([
      [2, 11, null],
      [1, 9, null],
      [7, 1, null],
      [5, 1, null],
    ]);

    // Test empty list
    expect(SORT_DIFF([])).toEqual([]);
  });

  // Test for SORT_SSIDE
  test('should sort rectangles by short side descending', () => {
    const a: PackerRect[] = [
      [2, 9, null],
      [7, 3, null],
      [4, 5, null],
      [11, 3, null],
    ];
    const ordered = SORT_SSIDE(a);
    expect(ordered).toEqual([
      [4, 5, null],
      [11, 3, null],
      [7, 3, null],
      [2, 9, null],
    ]);

    // Test empty list
    expect(SORT_SSIDE([])).toEqual([]);
  });

  // Test for SORT_LSIDE
  test('should sort rectangles by long side descending', () => {
    const a: PackerRect[] = [
      [19, 5, null],
      [32, 5, null],
      [6, 19, null],
      [9, 11, null],
    ];
    const ordered = SORT_LSIDE(a);
    expect(ordered).toEqual([
      [32, 5, null],
      [6, 19, null],
      [19, 5, null],
      [9, 11, null],
    ]);

    // Test empty list
    expect(SORT_LSIDE([])).toEqual([]);
  });

  // Test for SORT_RATIO
  test('should sort rectangles by width/height descending', () => {
    const a: PackerRect[] = [
      [12, 5, null],
      [15, 4, null],
      [4, 1, null],
      [1, 2, null],
    ];
    const ordered = SORT_RATIO(a);
    expect(ordered).toEqual([
      [4, 1, null],
      [15, 4, null],
      [12, 5, null],
      [1, 2, null],
    ]);

    // Test empty list
    expect(SORT_RATIO([])).toEqual([]);
  });
});
