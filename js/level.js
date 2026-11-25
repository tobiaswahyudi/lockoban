const TOOLS_BUTTON = {
  top: 107,
  left: 0,
  width: 266,
  height: 462,
  offset: 12,
};

const CLOSE_DRAW_BUTTON = {
  top: 300,
  left: 30,
  width: 168,
  height: 72,
  offset: 12,
};

const TOOLS_HINT = {
  top: 50,
  left: 20,
};

const PICK_HINT = {
  top: 590,
  left: 500,
};

// With the outer walls and such
const LOCK_POS = {
  top: 32,
  left: 352,
  width: 576,
  height: 512,
  wall: 32,
};

// lock inner
const LOCK_SIZE = {
  left: LOCK_POS.left + LOCK_POS.wall,
  top: LOCK_POS.top + LOCK_POS.wall,
  width: LOCK_POS.width - 2 * LOCK_POS.wall,
  height: LOCK_POS.height - 2 * LOCK_POS.wall,
};

const cellW = LOCK_SIZE.width / LOCK_MAP_SIZE.width;
const cellH = LOCK_SIZE.height / LOCK_MAP_SIZE.height;

const LOCK_BARS = {
  width: 128,
  left: 64,
};

const FILTER_RATIO = 4;

class Level {
  constructor(game) {
    this.game = game;

    this.isEditingPick = false;

    this.currentMouseDownEditing = {};

    this.isLevelEditorMode = false;

    this.buttons = [];

    this.toolsButton = new CanvasButton(
      game,
      TOOLS_BUTTON.left,
      TOOLS_BUTTON.top + TOOLS_BUTTON.offset,
      {
        width: TOOLS_BUTTON.width,
        height: TOOLS_BUTTON.height,
        handler: () => {
          this.isEditingPick = true;
        },
      },
    );

    this.closeDrawButton = new CanvasButton(
      game,
      CLOSE_DRAW_BUTTON.left + CLOSE_DRAW_BUTTON.offset,
      CLOSE_DRAW_BUTTON.top + CLOSE_DRAW_BUTTON.offset,
      {
        width: CLOSE_DRAW_BUTTON.width,
        height: CLOSE_DRAW_BUTTON.height,
        handler: () => {
          this.isEditingPick = false;
        },
      },
    );

    this.buttons.push(this.toolsButton);
    this.buttons.push(this.closeDrawButton);

    this.map = new Array(LOCK_MAP_SIZE.height)
      .fill(0)
      .map((_) =>
        new Array(LOCK_MAP_SIZE.width).fill(0).map((_) => Math.random() > 0.8),
      );
  }

  startLevelEditorMode() {
    this.isLevelEditorMode = !this.isLevelEditorMode;
    if (this.isLevelEditorMode) {
      this.map.forEach((row) => row.forEach((_, idx) => (row[idx] = false)));
    } else {
      console.log(
        this.map
          .map((row) => row.map((c) => (c ? "#" : ".")).join(""))
          .join("\n"),
      );
    }
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
    this.buttons.forEach((b) => {
      if (b.hovered && b.handler) {
        b.handler();
      }
    });
  }

  handleMouseUp() {
    Object.keys(this.currentMouseDownEditing).forEach((k) => {
      const [r, c] = k.split(",");
      const ir = Number(r);
      const ic = Number(c);
      if (ir < 0 || ic < 0) return;
      this.map[ir][ic] ^= true;
    });
    this.currentMouseDownEditing = {};
  }

  drawFilter() {
    const dw = this.game.width / FILTER_RATIO;
    const dh = this.game.height / FILTER_RATIO;
    for (let i = 0; i < FILTER_RATIO; i++) {
      for (let j = 0; j < FILTER_RATIO; j++) {
        this.game.drawImage(ASSETS.UI.FILTER, dw * i, dh * j, dw, dh);
      }
    }
  }

  drawLockWalls() {
    const wallColor = this.isLevelEditorMode ? COLORS.SCARLET : COLORS.BLACK;

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
        fill: wallColor,
      },
    );

    this.game.drawRect(
      LOCK_SIZE.left,
      LOCK_SIZE.top,
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

    this.game.drawText(
      ["Mouse to move lockpick"],
      PICK_HINT.left,
      PICK_HINT.top,
      {
        color: COLORS.RED,
        font: "600 24px Edu-SA",
        lineSpacing: 30,
      },
    );
  }

  drawLockMap() {
    this.map.forEach((row, ridx) => {
      row.forEach((cell, cidx) => {
        const isEditing =
          this.currentMouseDownEditing[`${ridx},${cidx}`] ?? false;

        // should be easy to get a bitwise operation here but wtv
        const cellOn = isEditing ? !cell : cell;
        if (!cellOn) return;

        this.game.drawRect(
          LOCK_POS.left + LOCK_POS.wall + cidx * cellW,
          LOCK_POS.top + LOCK_POS.wall + ridx * cellH,
          cellW,
          cellH,
          {
            fill: COLORS.SLATE,
          },
        );
      });
    });
  }

  drawToolButton() {
    this.game.drawText(
      ["Click tools to", "modify pick shape"],
      TOOLS_HINT.left,
      TOOLS_HINT.top,
      {
        color: COLORS.RED,
        font: "600 24px Edu-SA",
        lineSpacing: 30,
      },
    );

    this.game.drawImage(
      this.toolsButton.hovered
        ? ASSETS.UI.TOOLS.HOVER
        : ASSETS.UI.TOOLS.DEFAULT,
      TOOLS_BUTTON.left,
      TOOLS_BUTTON.top,
    );
  }

  drawPickEditOverlay() {
    if (!this.isEditingPick) return;
    this.drawFilter();

    this.game.drawImage(
      this.closeDrawButton.hovered
        ? ASSETS.UI.BUTTON.HOVER
        : ASSETS.UI.BUTTON.DEFAULT,
      CLOSE_DRAW_BUTTON.left,
      CLOSE_DRAW_BUTTON.top,
    );

    this.game.drawText(
      ["Back to", "Lockpicking"],
      CLOSE_DRAW_BUTTON.left +
        CLOSE_DRAW_BUTTON.width / 2 +
        CLOSE_DRAW_BUTTON.offset,
      CLOSE_DRAW_BUTTON.top + CLOSE_DRAW_BUTTON.height / 2,
      {
        color: COLORS.WHITE,
        align: "center",
        font: "600 18px Edu-SA",
      },
    );
  }

  render() {
    const { width, height } = this.game;

    this.closeDrawButton.disabled = !this.isEditingPick;
    this.toolsButton.disabled = this.isEditingPick;

    // get mouse position
    const mouseOnCellCorner = {
      x: Math.floor((this.game.mouse.x - LOCK_SIZE.left) / cellW),
      y: Math.floor((this.game.mouse.y - LOCK_SIZE.top) / cellH),
    };

    // Game area background
    this.game.drawRect(0, 0, width, height, { fill: COLORS.CREAM });

    // do all buttons first
    this.buttons.forEach((b) => b.render());

    this.drawLockWalls();

    // Lockpick
    this.game.drawRect(560, 570, 3, 80, {
      fill: COLORS.RED,
    });

    this.drawToolButton();
    this.drawLockMap();

    this.drawPickEditOverlay();

    if (!this.isLevelEditorMode)
      this.game.drawCircle(
        LOCK_SIZE.left + cellW * mouseOnCellCorner.x,
        LOCK_SIZE.top + cellH * mouseOnCellCorner.y,
        4,
        COLORS.RED,
        true,
      );

    // LEVEL EDITOR
    if (this.isLevelEditorMode) {
      if (this.game.mouse.clicked) {
        this.currentMouseDownEditing[
          `${mouseOnCellCorner.y},${mouseOnCellCorner.x}`
        ] = true;
      }

      this.game.drawText(
        ["LEVEL", "EDITOR", "MODE"],
        CLOSE_DRAW_BUTTON.left +
          CLOSE_DRAW_BUTTON.width / 2 +
          CLOSE_DRAW_BUTTON.offset,
        CLOSE_DRAW_BUTTON.top + CLOSE_DRAW_BUTTON.height / 2,
        {
          color: COLORS.WHITE,
          align: "center",
          font: "600 36px Edu-SA",
        },
      );

      // Draw mouse
      this.game.drawRect(
        LOCK_SIZE.left + cellW * mouseOnCellCorner.x,
        LOCK_SIZE.top + cellH * mouseOnCellCorner.y,
        cellW,
        cellH,
        {
          fill: "#fe5a8f88",
        },
      );
    }
  }
}
