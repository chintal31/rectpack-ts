import { Rectangle } from '@src/geometry';

const SORT_AREA = (rectlist: Rectangle[]): Rectangle[] => {
  return rectlist.sort((r1, r2) => r2[0] * r2[1] - r1[0] * r1[1]);
};

export { SORT_AREA };
