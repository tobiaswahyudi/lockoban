class CanvasButton {
  constructor(game, x, y, params) {
    this.game = game;
    this.hovered = false;
    this.disabled = params.disabled ?? false;
    this.params = {
      render: false,
      strokeWeight: 2,
      stroke: "#000000",
      fill: "#dddddd",
      hoverStrokeWeight: 4,
      hoverStroke: "#444444",
      hoverFill: "#ffffff",
      text: "",
      textSize: 18,
      textColor: "#000000",
      hoverTextColor: "#444444",
      handler: () => {},
      width: 64,
      height: 64,
      ...params,
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

    if (!this.params.render) return;

    this.game.drawRect(this.x, this.y, this.params.width, this.params.height, {
      fill: this.hovered ? this.params.hoverFill : this.params.fill,
      stroke: this.hovered ? this.params.hoverStroke : this.params.stroke,
      strokeWidth: this.hovered
        ? this.params.hoverStrokeWeight
        : this.params.strokeWeight,
    });

    this.game.drawText(
      this.params.text,
      this.x + this.params.width * 0.5,
      this.y + this.params.height * 0.5 - this.params.textSize * 0.3,
      {
        color: this.hovered
          ? this.params.hoverTextColor
          : this.params.textColor,
        font: `500 ${this.params.textSize}px Edu-SA`,
        align: "center",
      },
    );
  }
}
