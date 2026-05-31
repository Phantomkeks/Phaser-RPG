// Quest 2: Coffee Cups — collect 10 cups in 30 seconds
class QuestCoffeeCups extends BaseScene {
  constructor() {
    super("QuestCoffeeCups");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#2d2d2d");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 2: OFFICE COFFEE RUN", THEME.colors.blue);
    this.addSubtitle("Collect 10 coffee cups!", 60);

    this.makeCupTexture();

    this.player = this.physics.add
      .image(width / 2, height - 100, GameState.avatars.bride || "bride_default")
      .setScale(3);
    this.player.body.setCollideWorldBounds(true);

    this.collected = 0;
    this.timeLeft = 30;

    this.scoreText = this.add.text(20, 20, "CUPS: 0/10", THEME.text.hud);
    this.timeText = this.add
      .text(width - 20, 20, "TIME: 30", {
        ...THEME.text.hud,
        color: THEME.colors.red,
      })
      .setOrigin(1, 0);

    this.cups = this.physics.add.group();
    this.spawnCup();
    this.spawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnCup,
      callbackScope: this,
      loop: true,
    });
    this.tickTimer = this.time.addEvent({
      delay: 1000,
      callback: this.tick,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.overlap(this.player, this.cups, (p, cup) => {
      cup.destroy();
      this.collected++;
      this.scoreText.setText(`CUPS: ${this.collected}/10`);
      if (this.collected >= 10) this.win();
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  spawnCup() {
    const x = Phaser.Math.Between(40, this.scale.width - 40);
    const y = Phaser.Math.Between(100, this.scale.height - 50);
    const cup = this.cups.create(x, y, "coffeeCup").setScale(3);
    this.tweens.add({ targets: cup, y: y - 6, yoyo: true, repeat: -1, duration: 600 });
  }

  tick() {
    this.timeLeft--;
    this.timeText.setText("TIME: " + this.timeLeft);
    if (this.timeLeft <= 0) this.lose();
  }

  win() {
    this.spawnTimer.remove();
    this.tickTimer.remove();
    this.cups.clear(true, true);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "CAFFEINATED!\nQuest complete!", {
        ...THEME.text.questHeader,
        fontSize: "16px",
        color: THEME.colors.mint,
        align: "center",
        backgroundColor: THEME.colors.black,
        padding: { x: 16, y: 12 },
      })
      .setOrigin(0.5);
    GameState.quests.coffeeCups = true;
    GameState.save();
    this.time.delayedCall(1500, () => this.scene.start("OverworldScene"));
  }

  lose() {
    this.spawnTimer.remove();
    this.tickTimer.remove();
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Out of time! Try again!", {
        ...THEME.text.questHeader,
        color: THEME.colors.red,
        backgroundColor: THEME.colors.black,
        padding: { x: 16, y: 12 },
      })
      .setOrigin(0.5);
    this.time.delayedCall(1500, () => this.scene.restart());
  }

  update() {
    const speed = 220;
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.player.setVelocityY(speed);
  }

  makeCupTexture() {
    if (this.textures.exists("coffeeCup")) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(3, 4, 8, 9);
    g.fillStyle(0x6f4e37, 1);
    g.fillRect(4, 5, 6, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRect(11, 6, 2, 4);
    g.fillStyle(0xcccccc, 1);
    g.fillRect(2, 13, 10, 1);
    g.fillStyle(0xaaaaaa, 0.7);
    g.fillRect(5, 1, 1, 2);
    g.fillRect(8, 1, 1, 2);
    g.generateTexture("coffeeCup", 16, 16);
    g.destroy();
  }
}
