const TOOLS_BUTTON = {
  top: 119,
  left: 0,
  width: 266,
  height: 462,
};

const CLOSE_DRAW_BUTTON = {
  top: 310,
  left: 40,
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
  left: 640,
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

const HANDLE_Y_TO = 160;

class Level {
  constructor(game) {
    this.game = game;

    this.isEditingPick = false;

    this.currentMouseDownEditing = {};
    this.isLevelEditorMode = false;

    this.pickPoints = [new Position(0, 0), new Position(0, HANDLE_Y_TO)];

    this.pickEditingPoints = [];
    this.lastPickEditPoint = undefined;

    this.currentPickPosition = new Position(
      Math.floor(LOCK_MAP_SIZE.width / 2),
      Math.floor(LOCK_MAP_SIZE.height),
    );

    this.lastMoveDir = Direction.UP;

    this.toolsButton = new CanvasButton(
      game,
      TOOLS_BUTTON.left,
      TOOLS_BUTTON.top,
      {
        width: TOOLS_BUTTON.width,
        height: TOOLS_BUTTON.height,
        handler: this.startPickEditorMode.bind(this),
        normalSprite: ASSETS.UI.TOOLS.DEFAULT,
        hoverSprite: ASSETS.UI.TOOLS.HOVER,
        disabledSprite: undefined,
        spriteOffset: {
          x: 0,
          y: -12,
        },
      },
    );

    this.finishDrawButton = new CanvasButton(
      game,
      CLOSE_DRAW_BUTTON.left,
      CLOSE_DRAW_BUTTON.top,
      {
        width: CLOSE_DRAW_BUTTON.width,
        height: CLOSE_DRAW_BUTTON.height,
        handler: () => {
          this.isEditingPick = false;
          this.pickPoints = this.pickEditingPoints.map(
            (p) => new Position(p.x, p.y),
          );
        },
        spriteOffset: {
          x: -12,
          y: -12,
        },
        text: ["Done, use", "new lockpick"],
        textOffset: {
          x: 0,
          y: -12,
        },
      },
    );

    this.cancelDrawButton = new CanvasButton(
      game,
      CLOSE_DRAW_BUTTON.left,
      CLOSE_DRAW_BUTTON.top + 100,
      {
        width: CLOSE_DRAW_BUTTON.width,
        height: CLOSE_DRAW_BUTTON.height,
        handler: () => {
          this.isEditingPick = false;
        },
        spriteOffset: {
          x: -12,
          y: -12,
        },
        text: ["Cancel, use", "old lockpick"],
        textOffset: {
          x: 0,
          y: -12,
        },
      },
    );

    this.connectHandleButton = new CanvasButton(
      game,
      PICK_HINT.left - CLOSE_DRAW_BUTTON.width / 2,
      PICK_HINT.top - 32,
      {
        width: CLOSE_DRAW_BUTTON.width,
        height: CLOSE_DRAW_BUTTON.height,
        handler: this.finishCurrentPickEditing.bind(this),
        spriteOffset: {
          x: -12,
          y: -12,
        },
        text: ["Connect to", "Handle"],
        textOffset: {
          x: 0,
          y: -12,
        },
      },
    );

    this.buttons = [
      this.toolsButton,
      this.finishDrawButton,
      this.cancelDrawButton,
      this.connectHandleButton,
    ];

    // this.map = new Array(LOCK_MAP_SIZE.height)
    //   .fill(0)
    //   .map((_) =>
    //     new Array(LOCK_MAP_SIZE.width).fill(0).map((_) => Math.random() > 0.8),
    //   );

    this.map = LOCK_LAYOUT.split("\n")
      .filter((r) => r.length > 0)
      .map((r) => r.split("").map((c) => c == "#"));
  }

  checkMap(r, c) {
    if (r < 0 || r >= this.map.length) return true;
    if (c < 0 || c >= this.map[0].length) return true;
    return this.map[r][c];
  }

  drawLockpickPath(points, displace = new Position()) {
    const pickPath = new Path2D();

    // Draw line
    points.forEach((pt, idx) => {
      if (idx == 0) {
        pickPath.moveTo(...positionToArray(this.toPixelPos(displace.add(pt))));
      } else {
        pickPath.lineTo(...positionToArray(this.toPixelPos(displace.add(pt))));
      }
    });
    this.game.drawPath(pickPath, {
      stroke: COLORS.RED,
      strokeWidth: 3,
      fill: undefined,
    });
  }

  startPickEditorMode() {
    console.log("start pick editor; clear stuff");
    this.isEditingPick = true;
    this.finishDrawButton.disabled = true;

    this.pickEditingPoints = [];
    this.lastPickEditPoint = undefined;
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

  finishCurrentPickEditing() {
    if (this.pickEditingPoints.length == 0) return;
    // When finish pick editing, we just connect the last point downwards to +128
    // move the mouse just for a bit.
    const curMouse = { ...this.game.mouse };
    this.game.mouse.y += HANDLE_Y_TO * cellH;
    const goodToAdd = this.addNewPickPoint();
    this.game.mouse = curMouse;

    if (!goodToAdd) return;

    // Finish pick editing.
    this.finishDrawButton.disabled = false;
    this.lastPickEditPoint = undefined;
  }

  handleInput(keyCode) {
    switch (keyCode) {
      case "ArrowUp":
      case "KeyW": {
        this.lastMoveDir = Direction.UP;
        break;
      }
      case "ArrowDown":
      case "KeyS": {
        this.lastMoveDir = Direction.DOWN;
        break;
      }
      case "ArrowLeft":
      case "KeyA": {
        this.lastMoveDir = Direction.LEFT;
        break;
      }
      case "ArrowRight":
      case "KeyD": {
        this.lastMoveDir = Direction.RIGHT;
        break;
      }
      case "Space":
      case "KeyR":
      case "KeyZ":
      case "Escape":
      default:
        return false;
    }

    this.currentPickPosition = this.currentPickPosition.add(
      DirVec[this.lastMoveDir]
    );
    return true;
  }

  doPickEditChecks(cur) {
    const pc = this.pickEditingPoints.length;
    // If there's 0 or 1 point then there's no segments so it's good
    if (pc < 2) return true;

    // cant coincide with any existing point
    const anyPointCoincide = this.pickEditingPoints.some(
      (p) => p.x == cur.x && p.y == cur.y,
    );
    if (anyPointCoincide) return false;

    // Cant intersect any
    const pM1 = this.pickEditingPoints[pc - 1];
    const pM2 = this.pickEditingPoints[pc - 2];

    const lastLine = parseLine(pM1, pM2);
    const newLine = parseLine(cur, pM1);

    let anyCross = false;

    this.pickEditingPoints.forEach((p1, idx, arr) => {
      // Do for all except last segment
      if (idx >= pc - 2) return;
      const p2 = arr[idx + 1];

      const crosses = checkIntersect(newLine, true)(parseLine(p1, p2));
      anyCross = anyCross || crosses;
    });

    if (anyCross) return false;

    // check last seg with not strict (otherwise will fail cos same corner)
    return !checkIntersect(newLine, false)(lastLine);
  }

  // Returns false if point was not added
  addNewPickPoint() {
    // add new at current isometric position.
    if (this.isEditingPick) {
      if (!this.lastPickEditPoint) {
        this.lastPickEditPoint = this.mouseCorner;
        this.pickEditingPoints = [];
        this.pickEditingPoints.push(this.lastPickEditPoint);
        return true;
      } else {
        const newPoint = this.isometricCorner();
        if (!this.doPickEditChecks(newPoint)) {
          // Collision!
          console.log("Collision!! Bad!");
          return false;
        }
        this.lastPickEditPoint = newPoint;
        this.pickEditingPoints.push(this.lastPickEditPoint);
        return true;
      }
    }
  }

  handleMouseClick() {
    // Check buttons first -- but if any are clicked; don't do other checks
    let anyButtonClicked = false;
    const checkButton = (b) => {
      b.checkHovered(this.game.mouse.x, this.game.mouse.y);
      if (b.hovered && b.handler) {
        anyButtonClicked = true;
        b.handler();
      }
    };

    this.buttons.forEach(checkButton);

    this.currentMouseDown = this.mouseCorner;

    if (anyButtonClicked) return;

    this.addNewPickPoint();
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

    // If editing lockpick; put line
    this.currentMouseDown = undefined;
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
      ["WASD or Arrows to move lockpick"],
      PICK_HINT.left,
      PICK_HINT.top,
      {
        color: COLORS.RED,
        font: "600 24px Edu-SA",
        lineSpacing: 30,
        align: "center",
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
        if (cellOn) {
          this.game.drawRect(
            LOCK_POS.left + LOCK_POS.wall + cidx * cellW,
            LOCK_POS.top + LOCK_POS.wall + ridx * cellH,
            cellW,
            cellH,
            {
              fill: COLORS.SLATE,
            },
          );
        } else {
          if ((ridx + cidx) % 2 == 1) {
            this.game.drawRect(
              LOCK_POS.left + LOCK_POS.wall + cidx * cellW,
              LOCK_POS.top + LOCK_POS.wall + ridx * cellH,
              cellW,
              cellH,
              {
                fill: COLORS.WHITE,
              },
            );
          }
        }
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
  }

  drawPickEditOverlay() {
    if (!this.isEditingPick) return;
    this.drawFilter();

    this.finishDrawButton.render();
    this.cancelDrawButton.render();
    this.connectHandleButton.render();

    // Draw line
    this.drawLockpickPath(this.pickEditingPoints);

    if (!!this.lastPickEditPoint) {
      const newPath = new Path2D();
      newPath.moveTo(
        ...positionToArray(this.toPixelPos(this.lastPickEditPoint)),
      );
      newPath.lineTo(
        ...positionToArray(this.toPixelPos(this.isometricCorner())),
      );
      this.game.drawPath(newPath, {
        stroke: COLORS.SCARLET,
        strokeWidth: 3,
        fill: undefined,
      });
    }
  }

  get mouseCorner() {
    return {
      x: Math.round((this.game.mouse.x - LOCK_SIZE.left) / cellW),
      y: Math.round((this.game.mouse.y - LOCK_SIZE.top) / cellH),
    };
  }

  isometricCorner(bounded = false) {
    const curCorner = this.mouseCorner;
    if (!this.lastPickEditPoint) return curCorner;
    const xDelta = Math.abs(this.lastPickEditPoint.x - curCorner.x);
    const yDelta = Math.abs(this.lastPickEditPoint.y - curCorner.y);

    const xDir = (this.lastPickEditPoint.x - curCorner.x) / xDelta;
    const yDir = (this.lastPickEditPoint.y - curCorner.y) / yDelta;

    if (xDelta > yDelta) {
      return {
        x: bounded ? this.lastPickEditPoint.x + xDir : curCorner.x,
        y: this.lastPickEditPoint.y,
      };
    } else {
      return {
        y: bounded ? this.lastPickEditPoint.y + yDir : curCorner.y,
        x: this.lastPickEditPoint.x,
      };
    }
  }

  toPixelPos(corner) {
    return {
      x: LOCK_SIZE.left + cellW * corner.x,
      y: LOCK_SIZE.top + cellH * corner.y,
    };
  }

  // HELPER for collision checking
  drawPickVicinity(displacement) {
    const pc = this.pickPoints.length;

    const allVicinity = new Set(
      this.pickPoints
        // line pairs
        .flatMap((p1, idx, arr) => {
          // Do for all except last segment
          if (idx == pc - 1) return [];
          const p2 = arr[idx + 1];

          return [[p1, p2]];
        })
        .flatMap(([p1, p2]) => {
          return getLineVicinity(parseLine(p1, p2), this.lastMoveDir);
        })
        .map(strPosition),
    );

    const dedupVicinity = [...allVicinity].map(strToPosition);

    dedupVicinity.forEach(p => {
      const cell = p.add(displacement);

      const pp = this.toPixelPos(cell.add(new Position(0.5, 0.5)));
      this.game.drawCircle(
        pp.x,
        pp.y,
        2,
        this.checkMap(cell.y, cell.x) ? COLORS.RED : "#00FF00",
        true,
      );
    })
  }
  // END HELPER

  render() {
    const { width, height } = this.game;
    // Game area background
    this.game.drawRect(0, 0, width, height, { fill: COLORS.CREAM });

    // this.finishDrawButton.disabled = !this.isEditingPick;
    this.toolsButton.disabled = this.isEditingPick;

    // get mouse position
    const mouseOnCellCorner = this.mouseCorner;

    this.toolsButton.render();
    this.drawLockWalls();

    // Lockpick
    const pickEnd = this.pickPoints[0];
    const displacement = pickEnd.negate().add(this.currentPickPosition);

    // move pick position
    // if (!this.isEditingPick)
    //   this.currentPickPosition = this.isometricCorner(true);

    this.drawToolButton();
    this.drawLockMap();

    this.drawLockpickPath(this.pickPoints, displacement);
    this.drawPickVicinity(displacement);

    this.drawPickEditOverlay();

    if (!this.isLevelEditorMode) {
      this.game.drawCircle(
        LOCK_SIZE.left + cellW * mouseOnCellCorner.x,
        LOCK_SIZE.top + cellH * mouseOnCellCorner.y,
        4,
        COLORS.RED,
        true,
      );
    }

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

      const pixelPos = this.toPixelPos(mouseOnCellCorner);

      this.game.drawRect(pixelPos.x, pixelPos.y, cellW, cellH, {
        fill: "#fe5a8f88",
      });
    }
  }
}
