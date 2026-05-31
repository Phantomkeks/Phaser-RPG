// Quest 10: Rescue the Cake — catch falling cake layers, dodge fly swatters.
// 30s timer, 8 layers to win.
class QuestCake extends BaseScene {
  constructor() {
    super("QuestCake");
  }

  create() {
    const { width, height } = this.scale;
    const sx = width / 800;
    const sy = height / 600;
    const s = Math.min(sx, sy);
    this._scale = s;
    this._sx = sx;
    this.cameras.main.setBackgroundColor("#3b2a52");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 10: RESCUE THE CAKE!", THEME.colors.pink);
    this.addSubtitle("Catch the layers — dodge the swatters!", 60 * sy);

    this.makeTextures();

    this.LAYERS_TO_WIN = 8;
    this.MAX_TIME = 30;
    this.caught = 0;
    this.timeLeft = this.MAX_TIME;
    this.gameOver = false;

    this.player = this.physics.add
      .image(width / 2, height - 70 * sy, GameState.avatars.bride || "bride_default")
      .setScale(3 * s);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(12, 12);

    this.scoreText = this.add.text(20 * sx, 20 * sy, `LAYERS: 0/${this.LAYERS_TO_WIN}`, {
      ...THEME.text.hud,
      color: THEME.colors.gold,
    });
    this.timeText = this.add
      .text(width - 20 * sx, 20 * sy, "TIME: " + this.timeLeft, { ...THEME.text.hud, color: THEME.colors.red })
      .setOrigin(1, 0);

    this.layers = this.physics.add.group();
    this.swatters = this.physics.add.group();

    this.physics.add.overlap(this.player, this.layers, (p, l) => {
      l.destroy();
      this.caught++;
      this.scoreText.setText(`LAYERS: ${this.caught}/${this.LAYERS_TO_WIN}`);
      if (this.caught >= this.LAYERS_TO_WIN) this.win();
    });
    this.physics.add.overlap(this.player, this.swatters, (p, s) => {
      s.destroy();
      this.cameras.main.shake(180, 0.008);
      this.caught = Math.max(0, this.caught - 1);
      this.scoreText.setText(`LAYERS: ${this.caught}/${this.LAYERS_TO_WIN}`);
    });

    this.spawnLayer = this.time.addEvent({
      delay: 1100,
      loop: true,
      callback: () => this.dropLayer(),
    });
    this.spawnSwatter = this.time.addEvent({
      delay: 1700,
      loop: true,
      callback: () => this.dropSwatter(),
    });
    this.tickTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tick(),
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.dpad = this.createVirtualDPad();

    const hint = this.isTouchDevice() ? "Use the D-pad to run!" : "Use ◀ ▶ to run!";
    this.statusText = this.add.text(width / 2, height - 30 * sy, hint, { ...THEME.text.tiny }).setOrigin(0.5);
  }

  dropLayer() {
    if (this.gameOver) return;
    const sx = this._sx || 1;
    const s = this._scale || 1;
    const x = Phaser.Math.Between(40 * sx, this.scale.width - 40 * sx);
    const layer = this.layers.create(x, -16, "cakeLayer").setScale(3 * s);
    layer.setVelocityY(Phaser.Math.Between(140, 200) * s);
  }

  dropSwatter() {
    if (this.gameOver) return;
    const sx = this._sx || 1;
    const s = this._scale || 1;
    const x = Phaser.Math.Between(40 * sx, this.scale.width - 40 * sx);
    const swat = this.swatters.create(x, -16, "swatter").setScale(3 * s);
    swat.setVelocityY(Phaser.Math.Between(180, 240) * s);
    swat.setAngularVelocity(Phaser.Math.Between(-200, 200));
  }

  tick() {
    if (this.gameOver) return;
    this.timeLeft--;
    this.timeText.setText("TIME: " + this.timeLeft);
    if (this.timeLeft <= 0) this.lose();
  }

  endGame() {
    this.gameOver = true;
    this.spawnLayer.remove();
    this.spawnSwatter.remove();
    this.tickTimer.remove();
    this.layers.clear(true, true);
    this.swatters.clear(true, true);
  }

  win() {
    this.endGame();
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "CAKE SAVED! ♥", {
        ...THEME.text.questHeader,
        fontSize: "18px",
        color: THEME.colors.mint,
        backgroundColor: THEME.colors.black,
        padding: { x: 16, y: 12 },
      })
      .setOrigin(0.5);
    GameState.quests.cake = true;
    GameState.save();
    this.time.delayedCall(1500, () => this.scene.start("OverworldScene"));
  }

  lose() {
    this.endGame();
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "CRUMBLED! Try again!", {
        ...THEME.text.questHeader,
        color: THEME.colors.red,
        backgroundColor: THEME.colors.black,
        padding: { x: 16, y: 12 },
      })
      .setOrigin(0.5);
    this.time.delayedCall(1500, () => this.scene.restart());
  }

  update() {
    if (this.gameOver) return;
    const speed = 260 * (this._scale || 1);
    this.player.setVelocityX(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.dpad && this.dpad.direction.x !== 0) {
      this.player.setVelocityX(this.dpad.direction.x * speed);
    }

    this.layers.children.iterate((l) => {
      if (l && l.y > this.scale.height + 20) l.destroy();
    });
    this.swatters.children.iterate((s) => {
      if (s && s.y > this.scale.height + 20) s.destroy();
    });
  }

  makeTextures() {
    const make = (key, draw) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, 16, 16);
      g.destroy();
    };
    make("cakeLayer", (g) => {
      g.fillStyle(0xfff3b0, 1);
      g.fillRect(2, 5, 12, 8);
      g.fillStyle(0xff6ec7, 1);
      g.fillRect(2, 4, 12, 2);
      g.fillStyle(0xef476f, 1);
      g.fillRect(4, 2, 1, 2);
      g.fillRect(8, 1, 1, 3);
      g.fillRect(11, 2, 1, 2);
      g.fillStyle(0xffd700, 1);
      g.fillRect(7, 0, 2, 1);
    });
    make("swatter", (g) => {
      g.fillStyle(0x6b6b6b, 1);
      g.fillRect(7, 8, 2, 8);
      g.fillStyle(0xef476f, 1);
      g.fillRect(2, 1, 12, 8);
      g.fillStyle(0x1a0a2e, 1);
      for (let y = 2; y < 8; y += 2) {
        for (let x = 3; x < 13; x += 2) g.fillRect(x, y, 1, 1);
      }
    });
  }
}
