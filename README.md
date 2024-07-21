# Rectpack

Rectpack is a TypeScript library that implements heuristic algorithms for solving the 2D knapsack problem, also known as the bin packing problem. This involves packing a set of rectangles into the smallest number of bins.

## Credits

This TypeScript library is a port of the Python library [rectpack](https://github.com/secnot/rectpack) by secnot. The structure and algorithms are based on the original rectpack library. Special thanks to the authors and contributors of rectpack for their work.

## Installation

To install rectpack, use npm:

```bash
npm install rectpack
```

## Basic Usage

Packing rectangles into a number of bins is easy:

```typescript
import { Packer, MaxRectsBaf } from 'rectpack';

const rectangles = [
  { width: 100, height: 30 },
  { width: 40, height: 60 },
  { width: 30, height: 30 },
  { width: 70, height: 70 },
  { width: 100, height: 50 },
  { width: 30, height: 30 },
];

const bins = [
  { width: 300, height: 450 },
  { width: 80, height: 40 },
  { width: 200, height: 150 },
];

const packer = new Packer({ binAlgo: MaxRectsBaf });

// Add the rectangles to the packing queue
for (const rect of rectangles) {
  packer.addRect(rect.width, rect.height);
}

// Add the bins where the rectangles will be placed
for (const bin of bins) {
  packer.addBin(bin.width, bin.height);
}

// Start packing
packer.pack();
```

Once the rectangles have been packed, the results can be accessed individually:

```typescript
// Obtain number of bins used for packing
const nbins = packer.numberOfBins;

// Index first bin
const abin = packer.getBin(0);

// Bin dimensions (bins can be reordered during packing)
const { width, height } = abin;

// Number of rectangles packed into the first bin
const nrect = abin.numberOfRectangles;

// Second bin's first rectangle
const rect = packer.getBin(1)[0];

// Rectangle properties
const [x, y, width, height] = rect;
```

Looping over all bins and rectangles:

```typescript
for (const bin of packer.binList()) {
  console.log(bin.id); // Bin id if it has one
  for (const rect of bin.rectList()) {
    console.log(rect);
  }
}
```

All dimensions (bins and rectangles) must be integers or decimals to avoid collisions caused by floating-point rounding.

## API

A more detailed description of API calls:

- `new Packer({ binAlgo?, packAlgo?, sortAlgo?, rotation? })`  
  Return a new packer object.

  - `binAlgo` (optional, default: `PackageBin.PackerBBF`): Bin selection heuristic.
    - `PackageBin.PackerBFF`: (Bin First Fit) Pack rectangle into the first bin it fits (without closing)
    - `PackageBin.PackerBNF`: (Bin Next Fit) If a rectangle doesn't fit into the current bin,
      close it and try next one.
    - `PackageBin.PackerBBF`: (Bin Best Fit) Pack rectangle into the bin that gives best fitness.
  - `packAlgo` (optional, default: `PackingAlgorithms.MaxRectsBssf`): Packing algorithm for rectangles.
    - `PackingAlgorithms.MaxRectsBl`: Bottom Left
    - `PackingAlgorithms.MaxRectsBssf`: Best Sort Side Fit minimize short leftover side
    - `PackingAlgorithms.MaxRectsBaf`: Best Area Fit pick maximal rectangle with smallest area
      where the rectangle can be placed
    - `PackingAlgorithms.MaxRectsBlsf`: Best Long Side Fit minimize long leftover side
  - `sortAlgo` (optional, default: `SORT_AREA`): Rectangle sort order before packing.
    - `SORT_NONE`: Rectangles left unsorted.
    - `SORT_AREA`: Sort by descending area.
    - `SORT_PERI`: Sort by descending perimeter.
    - `SORT_DIFF`: Sort by difference of rectangle sides.
    - `SORT_SSIDE`: Sort by shortest side.
    - `SORT_LSIDE`: Sort by longest side.
    - `SORT_RATIO`: Sort by ratio between sides.
  - `rotation` (optional, default: `true`): Enable or disable rectangle rotation.

- `packer.addBin(width, height[, count[, id]])`  
  Add empty bin(s) to a packer.

  - `width`: Bin width.
  - `height`: Bin height.
  - `count`: Number of bins to add, 1 by default.
  - `id`: Optional bin identifier.

- `packer.addRect(width, height[, id])`  
  Add rectangle to the packing queue.

  - `width`: Rectangle width.
  - `height`: Rectangle height.
  - `id`: User assigned rectangle id.

- `packer.pack()`:  
  Starts the packing process.

- `packer.rectList()`:  
  Returns the list of packed rectangles, each represented by the array `[ binIndex, x, y, width, height, id ]`.

## Testing

Run the tests with:

```bash
npm test
```
