class Level {
  constructor(game) {
    this.game = game;
    // this.animations = new AnimationManager(game, this.state);

    this.restartHeldSince = null;
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

  handleMouseMove() {
    // do stuff with this.game.mouse
  }

  handleMouseClick() {
    // do stuff with this.game.mouse
  }

  render() {
    const { width, height } = this.game;
    
    // Game area background
    this.game.drawRect(0, 0, width, height, { fill: "#C5BAB5" });
  }
}
