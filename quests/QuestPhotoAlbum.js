// Quest 8: Photo Album — match pairs of pixel-art memories.
// 4x3 grid of cards face-down. Match all 6 pairs to fill the album.
class QuestPhotoAlbum extends BaseScene {
  constructor() {
    super("QuestPhotoAlbum");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#3a2a18");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 8: PHOTO ALBUM", THEME.colors.blue);
    this.addSubtitle("Match the memories. Click two cards at a time.", 60);

    this.makeTextures();

    this.memories = [
      { key: "mem_beach", caption: "That tiny beach where you first said it." },
      { key: "mem_pizza", caption: "Pizza-on-the-floor moving night." },
      { key: "mem_concert", caption: "The concert you sang every word to." },
      { key: "mem_dog", caption: "The dog you almost adopted." },
      { key: "mem_camp", caption: "A tent, a thunderstorm, no regrets." },
      { key: "mem_coffee", caption: "Saturday cafe, no phones." },
    ];

    // Build card list (each memory twice), shuffle, lay out 4 cols x 3 rows.
    const deck = Phaser.Utils.Array.Shuffle(this.memories.flatMap((m) => [m.key, m.key]));

    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.locked = false;

    const cols = 4;
    const cellW = 110;
    const cellH = 100;
    const startX = (width - (cols - 1) * cellW) / 2;
    const startY = 130;

    deck.forEach((key, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      const card = this.add.image(x, y, "card_back").setScale(4).setInteractive({ useHandCursor: true });
      card.memoryKey = key;
      card.faceUp = false;
      card.matched = false;
      card.on("pointerdown", () => this.flip(card));
      this.cards.push(card);
    });

    this.statusText = this.add
      .text(width / 2, height - 40, "", {
        ...THEME.text.body,
        color: THEME.colors.gold,
      })
      .setOrigin(0.5);

    this.captionText = this.add
      .text(width / 2, height - 75, "", {
        ...THEME.text.small,
        color: THEME.colors.white,
        wordWrap: { width: width - 80 },
        align: "center",
      })
      .setOrigin(0.5);
  }

  flip(card) {
    if (this.locked || card.faceUp || card.matched) return;
    card.setTexture(card.memoryKey);
    card.faceUp = true;
    this.flipped.push(card);

    if (this.flipped.length === 2) this.evaluate();
  }

  evaluate() {
    this.locked = true;
    const [a, b] = this.flipped;

    if (a.memoryKey === b.memoryKey) {
      a.matched = b.matched = true;
      this.matched++;
      const m = this.memories.find((x) => x.key === a.memoryKey);
      this.captionText.setText(m.caption);
      this.statusText.setText("Matched! ♥").setColor(THEME.colors.mint);
      this.flipped = [];
      this.locked = false;
      if (this.matched >= this.memories.length) this.win();
    } else {
      this.statusText.setText("Not quite — try again").setColor(THEME.colors.red);
      this.time.delayedCall(900, () => {
        a.setTexture("card_back");
        a.faceUp = false;
        b.setTexture("card_back");
        b.faceUp = false;
        this.flipped = [];
        this.locked = false;
      });
    }
  }

  win() {
    this.statusText.setText("ALBUM COMPLETE! ♥").setColor(THEME.colors.mint);
    GameState.quests.photoAlbum = true;
    GameState.save();
    this.time.delayedCall(1800, () => this.scene.start("OverworldScene"));
  }

  makeTextures() {
    const make = (key, draw) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, 16, 16);
      g.destroy();
    };

    make("card_back", (g) => {
      g.fillStyle(0x6b4f8a, 1);
      g.fillRect(0, 0, 16, 16);
      g.lineStyle(1, 0xffd166, 1);
      g.strokeRect(1, 1, 14, 14);
      g.fillStyle(0xffd166, 1);
      g.fillRect(7, 7, 2, 2);
    });

    make("mem_beach", (g) => {
      g.fillStyle(0x7ec8ff, 1);
      g.fillRect(0, 0, 16, 9);
      g.fillStyle(0xfff3b0, 1);
      g.fillRect(0, 9, 16, 7);
      g.fillStyle(0xffd700, 1);
      g.fillRect(11, 1, 3, 3);
    });
    make("mem_pizza", (g) => {
      g.fillStyle(0xf6c177, 1);
      g.fillRect(2, 2, 12, 12);
      g.fillStyle(0xef476f, 1);
      g.fillRect(5, 5, 2, 2);
      g.fillRect(9, 9, 2, 2);
      g.fillStyle(0x52b788, 1);
      g.fillRect(8, 4, 1, 1);
      g.fillRect(4, 10, 1, 1);
    });
    make("mem_concert", (g) => {
      g.fillStyle(0x1a0a2e, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xff6ec7, 1);
      g.fillRect(7, 4, 2, 7);
      g.fillStyle(0xffd166, 1);
      g.fillRect(6, 11, 4, 1);
      g.fillStyle(0xffffff, 1);
      g.fillRect(2, 2, 1, 1);
      g.fillRect(13, 3, 1, 1);
      g.fillRect(11, 12, 1, 1);
    });
    make("mem_dog", (g) => {
      g.fillStyle(0x9c6644, 1);
      g.fillRect(4, 5, 8, 7);
      g.fillStyle(0x9c6644, 1);
      g.fillRect(3, 4, 2, 3);
      g.fillRect(11, 4, 2, 3);
      g.fillStyle(0x000000, 1);
      g.fillRect(6, 7, 1, 1);
      g.fillRect(9, 7, 1, 1);
      g.fillStyle(0x000000, 1);
      g.fillRect(7, 9, 2, 1);
    });
    make("mem_camp", (g) => {
      g.fillStyle(0x2d6a4f, 1);
      g.fillRect(0, 12, 16, 4);
      g.fillStyle(0xef476f, 1);
      for (let r = 0; r < 8; r++) {
        const w = 8 - r;
        g.fillRect(8 - Math.floor(w / 2), 4 + r, w, 1);
      }
      g.fillStyle(0xffd166, 1);
      g.fillRect(13, 1, 1, 1);
      g.fillRect(2, 2, 1, 1);
    });
    make("mem_coffee", (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 4, 8, 9);
      g.fillStyle(0x6f4e37, 1);
      g.fillRect(4, 5, 6, 3);
      g.fillStyle(0xffffff, 1);
      g.fillRect(11, 6, 2, 4);
      g.fillStyle(0xef476f, 1);
      g.fillRect(6, 6, 1, 1);
      g.fillRect(8, 6, 1, 1);
    });
  }
}
