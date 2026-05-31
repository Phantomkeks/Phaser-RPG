class BaseScene extends Phaser.Scene {
  // Adds a top-of-screen quest title in the given color.
  addQuestTitle(text, color) {
    const { width } = this.scale;
    return this.add
      .text(width / 2, 30, text, {
        ...THEME.text.questHeader,
        color,
      })
      .setOrigin(0.5);
  }

  addSubtitle(text, y = 60, color = THEME.colors.white) {
    return this.add
      .text(this.scale.width / 2, y, text, {
        ...THEME.text.small,
        color,
      })
      .setOrigin(0.5);
  }

  // Pink button with hand cursor; returns the text object.
  addButton(x, y, label, onClick, style = THEME.text.button) {
    const btn = this.add.text(x, y, label, style).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on("pointerdown", onClick);
    return btn;
  }

  // Wires ESC to return to the overworld. Quest scenes call this in create().
  enableEscToOverworld() {
    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.start("OverworldScene");
    });
  }
}
