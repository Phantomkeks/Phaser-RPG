// Quest 4: Cook Together — match ingredients to the recipe in order
class QuestCookTogether extends BaseScene {
  constructor() {
    super("QuestCookTogether");
  }

  create() {
    const { width, height } = this.scale;
    const sx = width / 800;
    const sy = height / 600;
    const s = Math.min(sx, sy);
    this.cameras.main.setBackgroundColor("#3a2618");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 4: COOK TOGETHER", THEME.colors.mint);
    this.addSubtitle("Click ingredients in the right order!", 60 * sy);

    this.makeTextures();

    this.recipe = ["tomato", "onion", "pasta", "cheese", "herb"];
    this.step = 0;

    this.recipeLabels = {};
    this.recipe.forEach((ing, i) => {
      const label = this.add
        .text(width / 2, (100 + i * 22) * sy, `${i + 1}. ${ing.toUpperCase()}`, {
          ...THEME.text.body,
          fontSize: "11px",
        })
        .setOrigin(0.5);
      label._baseText = label.text;
      this.recipeLabels[ing] = label;
    });

    const pot = this.add.graphics();
    pot.fillStyle(0x4a4e69, 1);
    pot.fillRoundedRect(width / 2 - 60 * sx, height - 200 * sy, 120 * sx, 60 * sy, 8);
    this.add.text(width / 2, height - 170 * sy, "POT", THEME.text.body).setOrigin(0.5);
    this._potY = height - 170 * sy;

    const layout = Phaser.Utils.Array.Shuffle([...this.recipe]);
    layout.forEach((ing, i) => {
      const x = (100 + i * 130) * sx;
      const y = height - 80 * sy;
      const sprite = this.add.image(x, y, ing).setScale(4 * s).setInteractive({ useHandCursor: true });
      sprite.on("pointerdown", () => this.pickIngredient(ing, sprite));
    });

    this.feedback = this.add
      .text(width / 2, height - 30 * sy, "", {
        ...THEME.text.body,
        color: THEME.colors.gold,
      })
      .setOrigin(0.5);
  }

  pickIngredient(ing, sprite) {
    const expected = this.recipe[this.step];
    if (ing === expected) {
      const label = this.recipeLabels[ing];
      label.setColor(THEME.colors.mint);
      label.setText("✓ " + label._baseText);
      this.tweens.add({
        targets: sprite,
        y: this._potY,
        x: this.scale.width / 2,
        duration: 400,
        ease: "Cubic.easeIn",
        onComplete: () => sprite.destroy(),
      });
      this.feedback.setText("Yum!");
      this.step++;
      if (this.step >= this.recipe.length) this.win();
    } else {
      this.feedback.setText("Not yet — check the recipe!");
      this.cameras.main.shake(150, 0.005);
    }
  }

  win() {
    this.feedback.setText("DINNER IS SERVED! ♥").setColor(THEME.colors.mint);
    GameState.quests.cookTogether = true;
    GameState.save();
    this.time.delayedCall(1500, () => this.scene.start("OverworldScene"));
  }

  makeTextures() {
    const make = (key, draw) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, 16, 16);
      g.destroy();
    };
    make("tomato", (g) => {
      g.fillStyle(0xef476f, 1);
      g.fillRect(3, 4, 10, 10);
      g.fillStyle(0x06d6a0, 1);
      g.fillRect(7, 2, 2, 3);
    });
    make("onion", (g) => {
      g.fillStyle(0xfaf3dd, 1);
      g.fillRect(4, 5, 8, 9);
      g.fillStyle(0xc8b88a, 1);
      g.fillRect(4, 6, 8, 1);
      g.fillRect(4, 9, 8, 1);
    });
    make("pasta", (g) => {
      g.fillStyle(0xffd166, 1);
      g.fillRect(3, 6, 10, 1);
      g.fillRect(3, 8, 10, 1);
      g.fillRect(3, 10, 10, 1);
    });
    make("cheese", (g) => {
      g.fillStyle(0xffe066, 1);
      g.fillRect(2, 5, 12, 8);
      g.fillStyle(0xff9c00, 1);
      g.fillRect(4, 7, 2, 2);
      g.fillRect(9, 9, 2, 2);
    });
    make("herb", (g) => {
      g.fillStyle(0x52b788, 1);
      g.fillRect(7, 2, 2, 12);
      g.fillRect(4, 5, 8, 2);
      g.fillRect(4, 9, 8, 2);
    });
  }
}
