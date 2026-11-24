const TOOLS_BUTTON = {
  top: 107,
  left: 0,
  width: 266,
  height: 462,
  offset: 12,
};

const LOCK_POS = {
  top: 32,
  left: 352,
  width: 576,
  height: 512,
  wall: 32,
};

const LOCK_SIZE = {
  width: LOCK_POS.width - 2 * LOCK_POS.wall,
  height: LOCK_POS.height - 2 * LOCK_POS.wall
}

const cellW = LOCK_SIZE.width / LOCK_MAP_SIZE.width;
const cellH = LOCK_SIZE.height / LOCK_MAP_SIZE.height;

const LOCK_BARS = {
  width: 128,
  left: 64,
};

class Level {
  constructor(game) {
    this.game = game;
    this.buttons = [];

    this.toolsButton = new CanvasButton(
      game,
      TOOLS_BUTTON.left,
      TOOLS_BUTTON.top + TOOLS_BUTTON.offset,
      {
        width: TOOLS_BUTTON.width,
        height: TOOLS_BUTTON.height,
      },
    );

    this.buttons.push(this.toolsButton);

    this.map = new Array(LOCK_MAP_SIZE.height)
      .fill(0)
      .map((_) =>
        new Array(LOCK_MAP_SIZE.width).fill(0).map((_) => Math.random() > 0.8),
      );
  }

  handleGameInput(keyCode) {
    switch (keyCode) {
      case "ArrowUp":
      case "KeyW":
      case "ArrowDown":
      case "KeyS":
      case "ArrowLeft":
      case "KeyA":
      case "ArrowRight":
      case "KeyD":
      case "Space":
      case "KeyR":
      case "KeyZ":
      case "Escape":
      default:
        return false;
    }
  }

  handleMouseClick() {
    // do stuff with this.game.mouse
  }

  render() {
    const { width, height } = this.game;

    // Game area background
    this.game.drawRect(0, 0, width, height, { fill: COLORS.CREAM });

    // do all buttons first
    this.buttons.forEach((b) => b.render());

    this.game.drawImage(
      this.toolsButton.hovered
        ? ASSETS.UI.TOOLS.HOVER
        : ASSETS.UI.TOOLS.DEFAULT,
      0,
      107,
    );

    this.game.drawRect(
      LOCK_POS.left + LOCK_BARS.left,
      0,
      LOCK_BARS.width,
      LOCK_POS.top,
      {
        fill: COLORS.SLATE,
      },
    );

    this.game.drawRect(
      LOCK_POS.left + LOCK_POS.width - LOCK_BARS.left - LOCK_BARS.width,
      0,
      LOCK_BARS.width,
      LOCK_POS.top,
      {
        fill: COLORS.SLATE,
      },
    );

    this.game.drawRect(
      LOCK_POS.left,
      LOCK_POS.top,
      LOCK_POS.width,
      LOCK_POS.height,
      {
        fill: COLORS.BLACK,
      },
    );

    this.game.drawRect(
      LOCK_POS.left + LOCK_POS.wall,
      LOCK_POS.top + LOCK_POS.wall,
      LOCK_SIZE.width,
      LOCK_SIZE.height,
      {
        fill: COLORS.CREAM,
      },
    );

    this.game.drawRect(
      LOCK_POS.left + 32 + 128,
      LOCK_POS.top + 32,
      LOCK_POS.width - 2 * (32 + 128),
      LOCK_POS.height + 32,
      {
        fill: COLORS.CREAM,
      },
    );

    this.game.drawRect(560, 570, 3, 80, {
      fill: COLORS.RED,
    });

    this.map.forEach((row, ridx) => {
      row.forEach((cell, cidx) => {
        if(!cell) return

        this.game.drawRect(
          LOCK_POS.left + LOCK_POS.wall + cidx * cellW,
          LOCK_POS.top + LOCK_POS.wall + ridx * cellH,
          cellW,
          cellH,
          {
            fill: COLORS.SLATE,
          },
        );
      })
    })
  }
}
