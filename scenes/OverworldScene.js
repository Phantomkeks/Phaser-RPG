class OverworldScene extends BaseScene {
  constructor() {
    super("OverworldScene");
  }

  create() {
    const { width, height } = this.scale;

    this.drawMap();

    this.add
      .text(width / 2, 20, "THE QUEST MAP", {
        ...THEME.text.questHeader,
        color: THEME.colors.white,
        stroke: THEME.colors.black,
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // 10 quest nodes laid out on a rough 5x2 grid; finale unlocks in the dead center.
    this.questNodes = [
      // Top row
      {
        key: "sockMonster",
        scene: "QuestSockMonster",
        x: 100,
        y: 130,
        label: "SOCK\nMONSTER",
        color: THEME.colors.red,
      },
      { key: "coffeeCups", scene: "QuestCoffeeCups", x: 260, y: 110, label: "COFFEE\nQUEST", color: THEME.colors.blue },
      {
        key: "weddingRing",
        scene: "QuestWeddingRing",
        x: 420,
        y: 130,
        label: "WEDDING\nRING",
        color: THEME.colors.gold,
      },
      { key: "photoAlbum", scene: "QuestPhotoAlbum", x: 580, y: 110, label: "PHOTO\nALBUM", color: THEME.colors.blue },
      { key: "vows", scene: "QuestVows", x: 720, y: 130, label: "WRITE\nVOWS", color: THEME.colors.gold },
      // Bottom row
      {
        key: "cookTogether",
        scene: "QuestCookTogether",
        x: 100,
        y: 420,
        label: "COOK\nTOGETHER",
        color: THEME.colors.mint,
      },
      { key: "garden", scene: "QuestGarden", x: 260, y: 440, label: "GARDEN", color: THEME.colors.mint },
      { key: "dance", scene: "QuestDance", x: 420, y: 420, label: "DANCE\nTOGETHER", color: THEME.colors.pink },
      { key: "cake", scene: "QuestCake", x: 580, y: 440, label: "RESCUE\nTHE CAKE", color: THEME.colors.pink },
      { key: "planTrip", scene: "QuestPlanTrip", x: 720, y: 420, label: "PLAN\nA TRIP", color: THEME.colors.pink },
    ];

    this.questSprites = [];
    this.questNodes.forEach((q) => this.makeQuestNode(q));

    // Bride is the only physics-controlled character; groom follows visually.
    // Spacing tuned so 16x16 sprites at scale 3 (48px wide) don't overlap.
    this.partyOffsetX = 50;
    this.bride = this.physics.add
      .image(width / 2 - this.partyOffsetX / 2, height - 80, GameState.avatars.bride || "bride_default")
      .setScale(3);
    this.bride.body.setCollideWorldBounds(true);
    this.groom = this.add
      .image(width / 2 + this.partyOffsetX / 2, height - 80, GameState.avatars.groom || "groom_default")
      .setScale(3);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.dpad = this.createVirtualDPad();

    // Cooldown to avoid re-triggering a quest the moment we return from it.
    this.questCooldown = 600;

    const hintText = this.isTouchDevice()
      ? "Walk into a node to start a quest. Use the D-pad to move."
      : "Walk into a node to start a quest. Arrow keys to move.";
    this.hint = this.add
      .text(width / 2, height - 30, hintText, {
        ...THEME.text.tiny,
        fontSize: "9px",
        backgroundColor: THEME.colors.black,
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);

    this.finaleNode = null;
    this.checkFinale();
  }

  drawMap() {
    const g = this.add.graphics();
    const tile = 16;
    for (let y = 0; y < this.scale.height; y += tile) {
      for (let x = 0; x < this.scale.width; x += tile) {
        const c = ((x + y) / tile) % 2 === 0 ? 0x2d6a4f : 0x40916c;
        g.fillStyle(c, 1);
        g.fillRect(x, y, tile, tile);
      }
    }
    g.fillStyle(0x9c6644, 1);
    g.fillRect(0, this.scale.height / 2 - 8, this.scale.width, 16);
    g.fillRect(this.scale.width / 2 - 8, 0, 16, this.scale.height);
  }

  makeQuestNode(q) {
    const done = GameState.quests[q.key];
    const colorInt = Phaser.Display.Color.HexStringToColor(q.color).color;

    const node = this.add.graphics();
    node.fillStyle(done ? 0x444444 : colorInt, 1);
    node.fillCircle(0, 0, 24);
    node.lineStyle(3, 0xffffff, 1);
    node.strokeCircle(0, 0, 24);
    node.x = q.x;
    node.y = q.y;

    if (done) {
      this.add
        .text(q.x, q.y, "✓", {
          ...THEME.text.questHeader,
          fontSize: "20px",
          color: THEME.colors.mint,
        })
        .setOrigin(0.5);
    }

    this.add
      .text(q.x, q.y + 40, q.label, {
        ...THEME.text.tiny,
        align: "center",
        stroke: THEME.colors.black,
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const zone = this.add.zone(q.x, q.y, 60, 60);
    this.physics.add.existing(zone, true);
    zone.questData = q;
    this.questSprites.push(zone);
  }

  checkFinale() {
    if (!GameState.allQuestsComplete()) return;
    const x = this.scale.width / 2;
    const y = this.scale.height / 2;
    const g = this.add.graphics();
    g.fillStyle(0xff6ec7, 1);
    g.fillCircle(x, y, 30);
    g.lineStyle(4, 0xffd166, 1);
    g.strokeCircle(x, y, 30);

    this.add
      .text(x, y, "♥", {
        ...THEME.text.questHeader,
        fontSize: "24px",
        color: THEME.colors.white,
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + 50, "FINALE!", {
        ...THEME.text.small,
        fontSize: "10px",
        color: THEME.colors.gold,
        stroke: THEME.colors.black,
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.finaleNode = this.add.zone(x, y, 70, 70);
    this.physics.add.existing(this.finaleNode, true);
  }

  update(_time, delta) {
    if (this.questCooldown > 0) this.questCooldown -= delta;

    const speed = 160;
    const v = { x: 0, y: 0 };
    if (this.cursors.left.isDown) v.x = -speed;
    if (this.cursors.right.isDown) v.x = speed;
    if (this.cursors.up.isDown) v.y = -speed;
    if (this.cursors.down.isDown) v.y = speed;

    // Virtual D-pad input (touch). Overrides keyboard only when active.
    if (this.dpad && (this.dpad.direction.x !== 0 || this.dpad.direction.y !== 0)) {
      v.x = this.dpad.direction.x * speed;
      v.y = this.dpad.direction.y * speed;
    }

    this.bride.setVelocity(v.x, v.y);
    this.groom.x = this.bride.x + this.partyOffsetX;
    this.groom.y = this.bride.y;

    if (this.questCooldown > 0) return;

    for (const z of this.questSprites) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.bride.getBounds(), z.getBounds())) {
        if (!GameState.quests[z.questData.key]) {
          this.scene.start(z.questData.scene);
          return;
        }
      }
    }

    if (
      this.finaleNode &&
      Phaser.Geom.Intersects.RectangleToRectangle(this.bride.getBounds(), this.finaleNode.getBounds())
    ) {
      this.scene.start("FinaleScene");
    }
  }
}
