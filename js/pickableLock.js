class PLock {
  constructor(keyhole, keyholeDir, cells) {
    this.cells = cells;
    // Which cell is the pickable
    this.keyhole = keyhole;
    // The keyhole needs to be moved this direction to dismantle
    this.keyholeDir = keyholeDir;
  }

  render(game) {
    this.cells.forEach(([ridx, cidx]) => {
      game.drawRect(
        ...positionToArray(toPixelPos(new Position(cidx, ridx))),
        cellW,
        cellH,
        {
          fill: COLORS.PINK,
        },
      );
    });
    const [ridx, cidx] = this.keyhole;
    game.drawRect(
      ...positionToArray(toPixelPos(new Position(cidx, ridx))),
      cellW,
      cellH,
      {
        fill: COLORS.PINK,
      },
    );
    game.drawImage(
      ASSETS.KEYHOLE,
      ...positionToArray(toPixelPos(new Position(cidx, ridx))),
      cellW,
      cellH,
    );
  }
}
