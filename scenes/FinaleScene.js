// FinaleScene — unlocks after all quests; shows the friends' messages
class FinaleScene extends BaseScene {
  constructor() {
    super("FinaleScene");
  }

  create() {
    const { width, height } = this.scale;
    const sx = width / 800;
    const sy = height / 600;
    const s = Math.min(sx, sy);
    this.cameras.main.setBackgroundColor("#1a0a2e");

    this.heartTimer = this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => this.spawnHeart(),
    });
    this.events.once("shutdown", () => this.heartTimer && this.heartTimer.remove());

    this.add
      .text(width / 2, 50 * sy, "♥ CONGRATULATIONS! ♥", {
        ...THEME.text.title,
        fontSize: "20px",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 90 * sy, "You completed every quest together.", {
        ...THEME.text.body,
        color: THEME.colors.gold,
      })
      .setOrigin(0.5);

    this.add.image(60 * sx, 60 * sy, GameState.avatars.bride || "bride_default").setScale(3 * s);
    this.add.image(width - 60 * sx, 60 * sy, GameState.avatars.groom || "groom_default").setScale(3 * s);
    this.add.text(width / 2, 115 * sy, "Messages from those who love you:", THEME.text.small).setOrigin(0.5);

    this.msgTopStart = 160 * sy;
    this.msgY = this.msgTopStart;
    this.messageTexts = [];

    for (const m of FRIENDS_MESSAGES) {
      const x = this.scale.width / 2;
      const y = this.msgY;

      const fromText = this.add
        .text(x, y, "— " + m.from + " —", {
          ...THEME.text.body,
          fontSize: "11px",
          color: m.color || THEME.colors.gold,
        })
        .setOrigin(0.5)
        .setAlpha(0);

      const bodyText = this.add
        .text(x, y + 22 * sy, m.text, {
          ...THEME.text.small,
          align: "center",
          wordWrap: { width: this.scale.width - 100 * sx },
          lineSpacing: 4,
        })
        .setOrigin(0.5, 0)
        .setAlpha(0);

      this.tweens.add({ targets: [fromText, bodyText], alpha: 1, duration: 600 });
      this.messageTexts.push(fromText, bodyText);
      this.msgY += 30 * sy + bodyText.height + 15 * sy;
    }

    this.hint = this.add
      .text(width / 2, height - 25 * sy, "♥ THE END ♥ — Live happily ever after.", { ...THEME.text.tiny })
      .setOrigin(0.5);
    this.hint.setColor(THEME.colors.pink);
  }

  spawnHeart() {
    const x = Phaser.Math.Between(0, this.scale.width);
    const heart = this.add
      .text(x, -20, "♥", {
        fontFamily: THEME.font,
        fontSize: Phaser.Math.Between(10, 18) + "px",
        color: Phaser.Utils.Array.GetRandom([
          THEME.colors.pink,
          THEME.colors.gold,
          THEME.colors.mint,
          THEME.colors.white,
        ]),
      })
      .setAlpha(0.5);
    this.tweens.add({
      targets: heart,
      y: this.scale.height + 20,
      duration: Phaser.Math.Between(4000, 8000),
      onComplete: () => heart.destroy(),
    });
  }
}
