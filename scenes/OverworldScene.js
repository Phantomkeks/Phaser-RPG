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
        icon: "sock",
      },
      {
        key: "coffeeCups",
        scene: "QuestCoffeeCups",
        x: 260,
        y: 110,
        label: "COFFEE\nQUEST",
        color: THEME.colors.gold,
        icon: "coffee",
      },
      {
        key: "weddingRing",
        scene: "QuestWeddingRing",
        x: 420,
        y: 130,
        label: "WEDDING\nRING",
        color: THEME.colors.green,
        icon: "ring",
      },
      {
        key: "photoAlbum",
        scene: "QuestPhotoAlbum",
        x: 580,
        y: 110,
        label: "PHOTO\nALBUM",
        color: THEME.colors.blue,
        icon: "camera",
      },
      {
        key: "vows",
        scene: "QuestVows",
        x: 720,
        y: 130,
        label: "WRITE\nVOWS",
        color: THEME.colors.lavender,
        icon: "scroll",
      },
      // Bottom row
      {
        key: "cookTogether",
        scene: "QuestCookTogether",
        x: 100,
        y: 420,
        label: "COOK\nTOGETHER",
        color: THEME.colors.coral,
        icon: "pan",
      },
      {
        key: "garden",
        scene: "QuestGarden",
        x: 260,
        y: 440,
        label: "GARDEN",
        color: THEME.colors.lime,
        icon: "flower",
      },
      {
        key: "dance",
        scene: "QuestDance",
        x: 420,
        y: 420,
        label: "DANCE\nTOGETHER",
        color: THEME.colors.purple,
        icon: "note",
      },
      {
        key: "cake",
        scene: "QuestCake",
        x: 580,
        y: 440,
        label: "RESCUE\nTHE CAKE",
        color: THEME.colors.pink,
        icon: "cake",
      },
      {
        key: "planTrip",
        scene: "QuestPlanTrip",
        x: 720,
        y: 420,
        label: "PLAN\nA TRIP",
        color: THEME.colors.teal,
        icon: "suitcase",
      },
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
        color: "#fff3b0",
        backgroundColor: "#4a2c2a",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);

    this.finaleNode = null;
    this.checkFinale();
  }

  drawMap() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Parchment base — warm cream with vertical streaks for an aged-paper feel.
    const g = this.add.graphics();
    g.fillStyle(0xe9d5a1, 1);
    g.fillRect(0, 0, w, h);

    const rand = Phaser.Math.RND;
    rand.sow(["marriage-quest-map"]);

    // Subtle paper grain — scattered darker and lighter specks.
    for (let i = 0; i < 1200; i++) {
      const x = rand.between(0, w);
      const y = rand.between(0, h);
      g.fillStyle(rand.pick([0xd4b483, 0xf3e4bb, 0xc9a874]), rand.realInRange(0.15, 0.4));
      g.fillRect(x, y, 2, 2);
    }

    // Coffee-stain blotches for character.
    for (let i = 0; i < 5; i++) {
      const cx = rand.between(60, w - 60);
      const cy = rand.between(60, h - 60);
      const r = rand.between(20, 40);
      g.fillStyle(0xb8945a, 0.18);
      g.fillCircle(cx, cy, r);
      g.fillStyle(0x8b6f3d, 0.12);
      g.fillCircle(cx + rand.between(-6, 6), cy + rand.between(-6, 6), r * 0.6);
    }

    // Torn-edge frame: dark inner border with rough corner notches.
    const frame = this.add.graphics();
    const ink = 0x4a2c2a;
    frame.lineStyle(3, ink, 0.85);
    frame.strokeRect(12, 12, w - 24, h - 24);
    frame.lineStyle(1, ink, 0.5);
    frame.strokeRect(18, 18, w - 36, h - 36);
    // Corner flourishes
    [
      [18, 18, 1, 1],
      [w - 18, 18, -1, 1],
      [18, h - 18, 1, -1],
      [w - 18, h - 18, -1, -1],
    ].forEach(([cx, cy, dx, dy]) => {
      frame.lineStyle(2, ink, 0.9);
      frame.beginPath();
      frame.moveTo(cx + 14 * dx, cy);
      frame.lineTo(cx, cy);
      frame.lineTo(cx, cy + 14 * dy);
      frame.strokePath();
    });

    // Dotted ink paths between quest nodes (in suggested play order).
    // We draw them BEFORE the decorations so foliage can sit on top.
    const order = [
      [100, 130], [260, 110], [420, 130], [580, 110], [720, 130],
      [720, 420], [580, 440], [420, 420], [260, 440], [100, 420],
    ];
    this.drawDottedPath(order, ink);

    // Tiny pixel illustrations between/around nodes — tucked into the gaps so
    // they decorate without crowding the path.
    const illustrations = [
      { type: "mountain", x: 60, y: 260 },
      { type: "mountain", x: 740, y: 260 },
      { type: "tree", x: 180, y: 240 },
      { type: "tree", x: 340, y: 250 },
      { type: "tree", x: 500, y: 240 },
      { type: "tree", x: 660, y: 250 },
      { type: "tree", x: 180, y: 320 },
      { type: "tree", x: 660, y: 320 },
      { type: "hill", x: 380, y: 300 },
      { type: "hill", x: 480, y: 320 },
      { type: "flower", x: 60, y: 200 },
      { type: "flower", x: 740, y: 200 },
      { type: "flower", x: 60, y: 350 },
      { type: "flower", x: 740, y: 350 },
      { type: "flower", x: 200, y: 540 },
      { type: "flower", x: 600, y: 540 },
      { type: "flower", x: 130, y: 80 },
      { type: "flower", x: 670, y: 80 },
      { type: "compass", x: 60, y: 540 },
      { type: "scroll", x: 740, y: 540 },
    ];
    illustrations.forEach((d) => this.drawDecoration(d));

    // "X marks the spot" in the very center where the finale unlocks.
    this.add
      .text(w / 2, h / 2 - 80, "✦  HERE WAITS FOREVER  ✦", {
        fontFamily: '"Press Start 2P"',
        fontSize: "8px",
        color: "#4a2c2a",
      })
      .setOrigin(0.5)
      .setAlpha(0.5);
  }

  drawDottedPath(points, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 0.55);
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(dist / 10);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        // Slight sine wiggle so the path feels hand-drawn, not ruler-straight.
        const wobble = Math.sin(t * Math.PI * 3) * 4;
        const nx = -dy / dist;
        const ny = dx / dist;
        const px = x1 + dx * t + nx * wobble;
        const py = y1 + dy * t + ny * wobble;
        g.fillRect(px - 1, py - 1, 2, 2);
      }
    }
  }

  drawDecoration({ type, x, y }) {
    const g = this.add.graphics();
    const px = 2;
    const draw = (cells, color, alpha = 1) => {
      g.fillStyle(color, alpha);
      cells.forEach(([cx, cy]) => g.fillRect(x + cx * px, y + cy * px, px, px));
    };
    switch (type) {
      case "mountain":
        draw([[3,0],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[4,2],[5,2],[0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3]], 0x8b6f3d);
        draw([[2,1],[3,0],[1,2],[0,3]], 0xfff3b0); // snow cap highlights
        break;
      case "tree":
        draw([[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3]], 0x4a7c3a);
        draw([[2,4],[2,5]], 0x5a3a1a);
        break;
      case "hill":
        draw([[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[4,3],[5,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4]], 0x9c8050);
        break;
      case "flower":
        draw([[1,1],[2,0],[3,1],[2,2]], 0xff6ec7);
        draw([[2,1]], 0xffd166);
        draw([[2,3],[2,4]], 0x4a7c3a);
        break;
      case "compass":
        draw([[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4]], 0x4a2c2a);
        draw([[2,2]], 0xffd166);
        break;
      case "scroll":
        draw([[0,1],[1,1],[2,1],[3,1],[4,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3],[4,3]], 0xfff3b0);
        draw([[1,2],[2,2],[3,2]], 0x8b6f3d);
        break;
    }
  }

  makeQuestNode(q) {
    const done = GameState.quests[q.key];
    const colorInt = Phaser.Display.Color.HexStringToColor(q.color).color;

    // Container so we can pulse the whole node (ring + icon) together.
    const container = this.add.container(q.x, q.y);

    if (!done) {
      const glow = this.add.graphics();
      glow.fillStyle(colorInt, 0.25);
      glow.fillCircle(0, 0, 32);
      container.add(glow);
    }

    const node = this.add.graphics();
    node.fillStyle(done ? 0x444444 : colorInt, 1);
    node.fillCircle(0, 0, 24);
    node.lineStyle(3, 0xffffff, 1);
    node.strokeCircle(0, 0, 24);
    container.add(node);

    if (done) {
      const check = this.add
        .text(0, 0, "✓", {
          ...THEME.text.questHeader,
          fontSize: "20px",
          color: THEME.colors.mint,
        })
        .setOrigin(0.5);
      container.add(check);
    } else {
      const icon = this.drawQuestIcon(q.icon);
      if (icon) container.add(icon);

      this.tweens.add({
        targets: container,
        scale: { from: 1, to: 1.08 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
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

  // Returns a Graphics drawing of a tiny pixel icon centered on (0,0).
  // Each "pixel" in the icon grid is rendered as a 2x2 px block.
  drawQuestIcon(name) {
    const g = this.add.graphics();
    const px = 2;
    const draw = (cells, color) => {
      g.fillStyle(color, 1);
      cells.forEach(([cx, cy]) => g.fillRect(cx * px, cy * px, px, px));
    };
    // Coordinates are relative to a small grid; we offset to roughly center it.
    const offset = (cx, cy) => [cx - 5, cy - 5];
    const cells = (arr) => arr.map(([x, y]) => offset(x, y));

    switch (name) {
      case "sock":
        draw(
          cells([
            [3, 2],
            [4, 2],
            [5, 2],
            [6, 2],
            [3, 3],
            [6, 3],
            [3, 4],
            [6, 4],
            [3, 5],
            [6, 5],
            [3, 6],
            [6, 6],
            [7, 6],
            [3, 7],
            [7, 7],
          ]),
          0xffffff
        );
        draw(
          cells([
            [3, 2],
            [4, 2],
            [5, 2],
            [6, 2],
            [3, 3],
            [6, 3],
          ]),
          0xff6ec7
        );
        break;
      case "coffee":
        draw(
          cells([
            [3, 3],
            [4, 3],
            [5, 3],
            [6, 3],
            [3, 4],
            [6, 4],
            [7, 4],
            [3, 5],
            [6, 5],
            [7, 5],
            [3, 6],
            [6, 6],
            [3, 7],
            [4, 7],
            [5, 7],
            [6, 7],
          ]),
          0xffffff
        );
        draw(
          cells([
            [4, 2],
            [5, 2],
          ]),
          0xffffff
        ); // steam
        break;
      case "ring":
        draw(
          cells([
            [4, 2],
            [5, 2],
          ]),
          0x9be7ff
        ); // gem
        draw(
          cells([
            [3, 3],
            [4, 4],
            [5, 4],
            [6, 3],
            [3, 5],
            [6, 5],
            [4, 6],
            [5, 6],
          ]),
          0xffd166
        );
        break;
      case "camera":
        draw(
          cells([
            [3, 3],
            [4, 3],
            [5, 3],
            [6, 3],
            [7, 3],
            [3, 4],
            [7, 4],
            [3, 5],
            [7, 5],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6],
          ]),
          0x222222
        );
        draw(
          cells([
            [5, 4],
            [5, 5],
            [6, 4],
          ]),
          0x9be7ff
        ); // lens
        draw(cells([[6, 2]]), 0xff6ec7); // flash
        break;
      case "scroll":
        draw(
          cells([
            [3, 2],
            [4, 2],
            [5, 2],
            [6, 2],
            [7, 2],
            [3, 3],
            [7, 3],
            [3, 4],
            [4, 4],
            [5, 4],
            [6, 4],
            [7, 4],
            [3, 5],
            [7, 5],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6],
            [3, 7],
            [7, 7],
          ]),
          0xfff3b0
        );
        draw(
          cells([
            [4, 4],
            [5, 4],
            [6, 4],
            [4, 6],
            [5, 6],
          ]),
          0x9c6644
        );
        break;
      case "pan":
        draw(
          cells([
            [3, 4],
            [4, 4],
            [5, 4],
            [6, 4],
            [7, 4],
            [3, 5],
            [7, 5],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6],
            [8, 5],
          ]),
          0x222222
        );
        draw(cells([[5, 3]]), 0xffd166); // sizzle
        break;
      case "flower":
        draw(cells([[5, 3]]), 0xffd166); // center
        draw(
          cells([
            [4, 2],
            [6, 2],
            [4, 4],
            [6, 4],
            [5, 2],
            [5, 4],
            [3, 3],
            [7, 3],
          ]),
          0xff6ec7
        );
        draw(
          cells([
            [5, 5],
            [5, 6],
            [5, 7],
            [4, 7],
            [6, 7],
          ]),
          0x06d6a0
        );
        break;
      case "note":
        draw(
          cells([
            [5, 2],
            [6, 2],
            [5, 3],
            [6, 3],
            [5, 4],
            [6, 4],
            [5, 5],
            [3, 5],
            [4, 5],
            [3, 6],
            [4, 6],
          ]),
          0xffffff
        );
        break;
      case "cake":
        draw(
          cells([
            [4, 2],
            [5, 2],
            [6, 2],
          ]),
          0xffd166
        ); // candles top
        draw(
          cells([
            [3, 3],
            [4, 3],
            [5, 3],
            [6, 3],
            [7, 3],
          ]),
          0xff6ec7
        );
        draw(
          cells([
            [3, 4],
            [4, 4],
            [5, 4],
            [6, 4],
            [7, 4],
          ]),
          0xffffff
        );
        draw(
          cells([
            [2, 5],
            [3, 5],
            [4, 5],
            [5, 5],
            [6, 5],
            [7, 5],
            [8, 5],
          ]),
          0xff6ec7
        );
        draw(
          cells([
            [2, 6],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6],
            [8, 6],
          ]),
          0xffffff
        );
        break;
      case "suitcase":
        draw(
          cells([
            [5, 2],
            [6, 2],
          ]),
          0x9c6644
        ); // handle
        draw(
          cells([
            [3, 3],
            [4, 3],
            [5, 3],
            [6, 3],
            [7, 3],
            [8, 3],
            [3, 4],
            [8, 4],
            [3, 5],
            [8, 5],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6],
            [8, 6],
          ]),
          0x9c6644
        );
        draw(
          cells([
            [5, 4],
            [6, 4],
            [5, 5],
            [6, 5],
          ]),
          0xffd166
        );
        break;
      default:
        return null;
    }
    return g;
  }

  checkFinale() {
    if (!GameState.allQuestsComplete()) return;
    const x = this.scale.width / 2;
    const y = this.scale.height / 2;

    const finaleContainer = this.add.container(x, y);
    const glow = this.add.graphics();
    glow.fillStyle(0xff6ec7, 0.3);
    glow.fillCircle(0, 0, 44);
    finaleContainer.add(glow);

    const g = this.add.graphics();
    g.fillStyle(0xff6ec7, 1);
    g.fillCircle(0, 0, 30);
    g.lineStyle(4, 0xffd166, 1);
    g.strokeCircle(0, 0, 30);
    finaleContainer.add(g);

    const heart = this.add
      .text(0, 0, "♥", {
        ...THEME.text.questHeader,
        fontSize: "24px",
        color: THEME.colors.white,
      })
      .setOrigin(0.5);
    finaleContainer.add(heart);

    this.tweens.add({
      targets: finaleContainer,
      scale: { from: 1, to: 1.15 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

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
