class Pushable {
  constructor(cells = []) {
    this.relativeCells = cells;
    // Which cell is the pickable
    this.displacement = new Position(0, 0);

    // for each row & column, find the min and max bounds
    const rowBounds = {};
    const colBounds = {};

    const getRow = (r) => {
      if (!rowBounds[r]) rowBounds[r] = { lo: 1000, hi: -1 };
      return rowBounds[r];
    };

    const getCol = (c) => {
      if (!colBounds[c]) colBounds[c] = { lo: 1000, hi: -1 };
      return colBounds[c];
    };

    this.relativeCells.forEach(([r, c]) => {
      getCol(c).lo = Math.min(getCol(c).lo, r);
      getCol(c).hi = Math.max(getCol(c).hi, r);
      getRow(r).lo = Math.min(getRow(r).lo, c);
      getRow(r).hi = Math.max(getRow(r).hi, c);
    });

    // by now each bound should be set properly
    this.rowBounds = rowBounds;
    this.colBounds = colBounds;
  }

  get cells() {
    return this.relativeCells.map(([r, c]) =>
      new Position(c, r).add(this.displacement),
    );
  }

  boundsForDir(dir) {
    const axis =
      dir == Direction.UP || dir == Direction.DOWN
        ? this.colBounds
        : this.rowBounds;

    const otherAxis =
      dir == Direction.UP || dir == Direction.DOWN
        ? this.rowBounds
        : this.colBounds;

    const axisMaker =
      dir == Direction.UP || dir == Direction.DOWN
        ? (c, v) => new Position(c, v)
        : (c, v) => new Position(v, c);

    const end = dir == Direction.UP || dir == Direction.LEFT ? "lo" : "hi";
    const getter = (v) => axisMaker(v, axis[v][end]);
    const otherAxisBounds = Object.keys(otherAxis);

    return otherAxisBounds.map(getter);
  }

  render(game) {
    this.cells.forEach((pt) => {
      game.drawRect(
        ...positionToArray(toPixelPos(pt)),
        cellW,
        cellH,
        {
          fill: COLORS.SCARLET,
        },
      );
    });
  }
}
