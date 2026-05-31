// Quest 9: Garden of Memories — plant from a visible seed queue on a 4x4 grid.
// Match 3 same-color blooms in any row/column to count as one heart row.
// Bloom HEARTS_TO_WIN heart rows to win.
class QuestGarden extends BaseScene {
  constructor() {
    super("QuestGarden");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#2d4a2b");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 9: GARDEN OF MEMORIES", THEME.colors.mint);
    this.addSubtitle("Plant the next seed. 3 same-color in a line = a heart row.", 60);

    this.makeTextures();

    this.GRID = 4;
    this.HEARTS_TO_WIN = 4;
    this.QUEUE_SIZE = 3;
    this.cell = 70;

    this.flowerColors = ["pink", "gold", "mint", "red"];

    // Center grid horizontally, leaving room on the right for the seed bag.
    const gridW = (this.GRID - 1) * this.cell;
    this.startX = (width - gridW) / 2 - 60;
    this.startY = 130;

    this.tiles = [];
    this.heartsBloomed = 0;

    for (let r = 0; r < this.GRID; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < this.GRID; c++) {
        const x = this.startX + c * this.cell;
        const y = this.startY + r * this.cell;
        const sprite = this.add.image(x, y, "soil").setScale(4).setInteractive({ useHandCursor: true });
        sprite.on("pointerdown", () => this.plant(r, c));
        this.tiles[r][c] = { sprite, color: null, sprouting: false, locked: false };
      }
    }

    this.queue = [];
    for (let i = 0; i < this.QUEUE_SIZE; i++) this.queue.push(this.randomColor());
    this.buildSeedBag();
    this.renderQueue();

    this.statusText = this.add
      .text(width / 2, height - 60, "Plant the front seed. Plan ahead!", {
        ...THEME.text.body,
        color: THEME.colors.gold,
      })
      .setOrigin(0.5);

    this.heartsText = this.add.text(20, 20, "HEARTS: 0/" + this.HEARTS_TO_WIN, {
      ...THEME.text.hud,
      color: THEME.colors.pink,
    });
  }

  randomColor() {
    return Phaser.Utils.Array.GetRandom(this.flowerColors);
  }

  buildSeedBag() {
    const { width } = this.scale;
    const bagX = width - 110;
    const bagY = this.startY;

    this.add
      .text(bagX, bagY - 40, "SEED BAG", {
        ...THEME.text.body,
        color: THEME.colors.gold,
      })
      .setOrigin(0.5);

    this.add.text(bagX, bagY - 20, "NEXT ↓", THEME.text.tiny).setOrigin(0.5);

    // Three queue slots stacked vertically; index 0 is "next to plant".
    this.queueSprites = [];
    for (let i = 0; i < this.QUEUE_SIZE; i++) {
      const y = bagY + i * 60;
      const slot = this.add.image(bagX, y, "soil").setScale(3).setAlpha(0.4);
      const seed = this.add.image(bagX, y, "flower_pink").setScale(3);
      this.queueSprites.push({ slot, seed });
    }
  }

  renderQueue() {
    this.queueSprites.forEach((s, i) => {
      const color = this.queue[i];
      s.seed.setTexture("flower_" + color);
      // Highlight the next seed; dim the others.
      const isNext = i === 0;
      s.seed.setScale(isNext ? 4 : 3);
      s.seed.setAlpha(isNext ? 1 : 0.6);
    });
  }

  plant(r, c) {
    const tile = this.tiles[r][c];
    if (tile.color || tile.sprouting || tile.locked) return;

    const color = this.queue.shift();
    this.queue.push(this.randomColor());
    this.renderQueue();

    tile.sprouting = true;
    tile.sprite.setTexture("seed");
    this.statusText.setText("Sprouting...");

    this.time.delayedCall(600, () => {
      tile.color = color;
      tile.sprouting = false;
      tile.sprite.setTexture("flower_" + color);
      this.statusText.setText("Bloomed!");
      this.checkLines();
    });
  }

  checkLines() {
    const matches = [];

    for (let r = 0; r < this.GRID; r++) {
      for (let c = 0; c <= this.GRID - 3; c++) {
        const t = [this.tiles[r][c], this.tiles[r][c + 1], this.tiles[r][c + 2]];
        if (this.sameUnlockedColor(t)) matches.push(t);
      }
    }
    for (let c = 0; c < this.GRID; c++) {
      for (let r = 0; r <= this.GRID - 3; r++) {
        const t = [this.tiles[r][c], this.tiles[r + 1][c], this.tiles[r + 2][c]];
        if (this.sameUnlockedColor(t)) matches.push(t);
      }
    }

    if (matches.length === 0) return;
    matches.forEach((line) => this.bloomLine(line));
  }

  sameUnlockedColor(triple) {
    return (
      triple[0].color &&
      !triple.some((t) => t.locked) &&
      triple[0].color === triple[1].color &&
      triple[1].color === triple[2].color
    );
  }

  bloomLine(line) {
    line.forEach((t) => {
      t.locked = true;
    });
    this.heartsBloomed++;
    this.heartsText.setText(`HEARTS: ${this.heartsBloomed}/${this.HEARTS_TO_WIN}`);
    this.statusText.setText("A row of love! ♥").setColor(THEME.colors.mint);

    line.forEach((t, i) => {
      this.tweens.add({
        targets: t.sprite,
        scale: 5,
        duration: 200,
        yoyo: true,
        delay: i * 80,
        onYoyo: () => t.sprite.setTexture("heart_bloom"),
      });
    });

    if (this.heartsBloomed >= this.HEARTS_TO_WIN) {
      this.time.delayedCall(900, () => this.win());
    }
  }

  win() {
    this.statusText.setText("GARDEN IN FULL BLOOM! ♥").setColor(THEME.colors.mint);
    GameState.quests.garden = true;
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
    make("soil", (g) => {
      g.fillStyle(0x6b3e1f, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4a2a13, 1);
      g.fillRect(2, 3, 1, 1);
      g.fillRect(11, 5, 1, 1);
      g.fillRect(6, 9, 1, 1);
      g.fillRect(13, 12, 1, 1);
    });
    make("seed", (g) => {
      g.fillStyle(0x6b3e1f, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x52b788, 1);
      g.fillRect(7, 7, 2, 4);
      g.fillStyle(0x95d5b2, 1);
      g.fillRect(6, 6, 1, 1);
      g.fillRect(9, 6, 1, 1);
    });
    const flower = (key, petal) =>
      make(key, (g) => {
        g.fillStyle(0x6b3e1f, 1);
        g.fillRect(0, 0, 16, 16);
        g.fillStyle(0x52b788, 1);
        g.fillRect(7, 9, 2, 5);
        g.fillStyle(petal, 1);
        g.fillRect(6, 4, 4, 4);
        g.fillRect(5, 5, 1, 2);
        g.fillRect(10, 5, 1, 2);
        g.fillRect(7, 3, 2, 1);
        g.fillRect(7, 8, 2, 1);
        g.fillStyle(0xffd166, 1);
        g.fillRect(7, 5, 2, 2);
      });
    flower("flower_pink", 0xff6ec7);
    flower("flower_gold", 0xffd166);
    flower("flower_mint", 0x06d6a0);
    flower("flower_red", 0xef476f);
    make("heart_bloom", (g) => {
      g.fillStyle(0x6b3e1f, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xff6ec7, 1);
      g.fillRect(4, 5, 3, 3);
      g.fillRect(9, 5, 3, 3);
      g.fillRect(3, 6, 10, 3);
      g.fillRect(4, 9, 8, 2);
      g.fillRect(6, 11, 4, 1);
      g.fillRect(7, 12, 2, 1);
    });
  }
}
