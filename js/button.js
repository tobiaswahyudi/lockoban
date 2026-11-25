class CanvasButton {
  constructor(game, x, y, params) {
    this.game = game;
    this.hovered = false;
    this.disabled = params.disabled ?? false;
    this.hidden = false;
    this.params = {
      text: "",
      textOffset: {
        x: 0,
        y: 0,
      },
      textParams: {},
      handler: () => {},
      width: 64,
      height: 64,
      spriteOffset: {
        x: 0,
        y: 0,
      },
      normalSprite: ASSETS.UI.BUTTON.DEFAULT,
      hoverSprite: ASSETS.UI.BUTTON.HOVER,
      disabledSprite: ASSETS.UI.BUTTON.DISABLED,
      ...params,
    };

    this.params.textParams = {
      color: COLORS.WHITE,
      align: "center",
      font: "600 18px Edu-SA",
      ...this.params.textParams,
    };

    this.handler = this.params.handler;
    this.x = x;
    this.y = y;
  }

  checkHovered(mouseX, mouseY) {
    this.hovered =
      !this.disabled &&
      mouseX >= this.x &&
      mouseY >= this.y &&
      mouseX <= this.x + this.params.width &&
      mouseY <= this.y + this.params.height;
  }

  render() {
    this.checkHovered(this.game.mouse.x, this.game.mouse.y);

    if (this.hidden) return;

    if (this.params.normalSprite) {
      this.game.drawImage(
        this.params.disabledSprite && this.disabled
          ? this.params.disabledSprite
          : this.hovered
            ? this.params.hoverSprite
            : this.params.normalSprite,
        this.x + this.params.spriteOffset.x,
        this.y + this.params.spriteOffset.y,
      );
    }

    this.game.drawText(
      this.params.text,
      this.x + this.params.width * 0.5 + this.params.textOffset.x,
      this.y + this.params.height * 0.5 + this.params.textOffset.y,
      this.params.textParams,
    );
  }
}
