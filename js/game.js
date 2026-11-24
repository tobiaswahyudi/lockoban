const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;

const MS_PER_FRAME = 1000 / 60;

let requestedRedraw = null;

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.loopStarted = false;

    // Canvas dimensions
    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;

    // Input handling
    this.keys = {};
    this.keysPressed = {}; // For single keypress detection
    this.mouse = {
      x: 0,
      y: 0,
      clicked: false,
    };

    // Initialize modules
    this.level = new Level(this);

    this.assetsPreloaded = false;
    this.loadedImages = new Map();

    this.fontsLoaded = false;

    this.init();
  }

  init() {
    // Set canvas size
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.setupEventListeners();
    // this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.textRendering = "geometricPrecision";

    console.log("Game initialized");
  }

  setupEventListeners() {
    // Keyboard events
    window.addEventListener("keydown", (e) => {
      if (!this.keys[e.code]) {
        this.keysPressed[e.code] = true; // Single press detection
      }
      this.keys[e.code] = true;
      if (this.handleKeyPress(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      this.keysPressed[e.code] = false;
      e.preventDefault();

      if (e.code == "KeyR") {
        // On R key up, send a dummy input to re-render level
        this.handleKeyPress("KeyUp");
        this.requestRedraw();
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.offsetX / rect.width) * this.width;
      this.mouse.y = (e.offsetY / rect.height) * this.height;
    });

    this.canvas.addEventListener("click", (e) => {
      this.mouse.clicked = true;
      this.handleMouseClick(this.mouse.x, this.mouse.y);
      e.preventDefault();
    });

    // Prevent context menu
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  start() {
    console.log(this.scene);
    if (!this.isRunning) {
      this.isRunning = true;
      this.render(); // Initial render
      console.log("Game started");

      this.preloadImages().then(() => {
        this.assetsPreloaded = true;
        this.startLoop();
      });

      this.preloadFonts().then(() => {
        this.fontsLoaded = true;
        this.startLoop();
      });
    }
  }

  startLoop() {
    if (this.isRunning && !this.loopStarted) {
      this.loopStarted = true;
      // Run at 60fps
      setInterval(() => {
        this.render();
      }, MS_PER_FRAME);
    }
  }

  // Handle key presses based on current scene
  handleKeyPress(keyCode) {
    this.level.handleInput(keyCode);
  }

  handleMouseClick() {
    this.level.handleMouseClick();
  }

  render() {
    if (!this.assetsPreloaded) return;
    if (!this.fontsLoaded) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Set default styles
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#fff";
    this.ctx.font = "16px Courier New";

    // Render based on current scene
    this.level.render();
  }

  async loadImage(src) {
    if (this.loadedImages.has(src)) {
      return this.loadedImages.get(src);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Preload multiple images
  async preloadImages() {
    try {
      await Promise.all(ALL_ASSETS.map((path) => this.loadImage(path)));
      console.log("All images preloaded");
    } catch (error) {
      console.error("Error preloading images:", error);
    }
  }

  async preloadFonts() {
    try {
      await Promise.all(
        FONTS.map(([fontName, weights]) =>
          Promise.all(
            weights.map((weight) =>
              document.fonts.load(`${weight} 12px ${fontName}`),
            ),
          ),
        ),
      );
      console.log("All fonts preloaded");
    } catch (error) {
      console.error("Error preloading fonts:", error);
    }
  }

  // Draw image utility
  drawImage(src, x, y, width = null, height = null, clip = {}) {
    const { x: clipX, y: clipY, width: clipWidth, height: clipHeight } = clip;
    const img = this.loadedImages.get(src);
    if (!img) {
      console.warn(`Image not loaded: ${src}`);
      return;
    }

    if (Object.keys(clip).length > 0) {
      this.ctx.drawImage(
        img,
        clipX,
        clipY,
        clipWidth,
        clipHeight,
        x,
        y,
        width,
        height,
      );
    } else if (width && height) {
      this.ctx.drawImage(img, x, y, width, height);
    } else {
      this.ctx.drawImage(img, x, y);
    }
  }

  // Utility methods

  DRAW_PARAMS = {
    fill: "#fff",
    stroke: "#000",
    strokeWidth: 0,
  };

  getDrawParams(params = {}) {
    const result = {
      ...this.DRAW_PARAMS,
      ...params,
    };

    result.filled = !!result.fill;

    return result;
  }

  drawText(text, x, y, options = {}) {
    const {
      color = "#fff",
      font = "16px Courier New",
      align = "left",
      baseline = "top",
      lineSpacing = Number(font.match(/(\d+)px/)[1] || 16),
    } = options;

    if (typeof text === "object") {
      for (const line of text) {
        y = this.drawText(line, x, y, {
          ...options,
          lineSpacing: lineSpacing,
        });
      }
      return y;
    } else {
      this.ctx.fillStyle = color;
      this.ctx.font = font;
      this.ctx.textAlign = align;
      this.ctx.textBaseline = baseline;
      this.ctx.fillText(text, x, y);

      return y + lineSpacing;
    }
  }

  drawRect(x, y, width, height, params = {}) {
    const { fill, stroke, strokeWidth, filled } = this.getDrawParams(params);

    this.ctx.strokeStyle = stroke;
    this.ctx.fillStyle = fill;
    this.ctx.lineWidth = strokeWidth;

    if (filled) this.ctx.fillRect(x, y, width, height);
    if (strokeWidth) this.ctx.strokeRect(x, y, width, height);
  }

  drawPath(path, params = {}) {
    const { fill, stroke, strokeWidth, filled } = this.getDrawParams(params);

    this.ctx.strokeStyle = stroke;
    this.ctx.fillStyle = fill;
    this.ctx.lineWidth = strokeWidth;

    if (filled) this.ctx.fill(path);
    if (strokeWidth) this.ctx.stroke(path);
  }

  drawCircle(x, y, radius, color = "#fff", filled = true) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;

    if (filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  // Collision detection utility
  isColliding(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  // Distance calculation
  getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

// Initialize and start the game when the page loads
window.addEventListener("load", () => {
  const game = new Game();
  game.start();
});
