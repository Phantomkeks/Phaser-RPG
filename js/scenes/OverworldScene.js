class OverworldScene extends Phaser.Scene {
  constructor() {
    super('OverworldScene');
  }

  create() {
    const { width, height } = this.scale;

    // Tiled grass background
    this.drawMap();

    this.add.text(width / 2, 20, 'THE QUEST MAP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Quest nodes
    this.questNodes = [
      { key: 'sockMonster',  scene: 'QuestSockMonster',  x: 150, y: 200, label: 'SOCK\nMONSTER',  color: '#ef476f' },
      { key: 'coffeeCups',   scene: 'QuestCoffeeCups',   x: 400, y: 150, label: 'COFFEE\nQUEST',   color: '#118ab2' },
      { key: 'weddingRing',  scene: 'QuestWeddingRing',  x: 650, y: 220, label: 'WEDDING\nRING',   color: '#ffd166' },
      { key: 'cookTogether', scene: 'QuestCookTogether', x: 250, y: 420, label: 'COOK\nTOGETHER', color: '#06d6a0' },
      { key: 'planTrip',     scene: 'QuestPlanTrip',     x: 550, y: 420, label: 'PLAN\nA TRIP',   color: '#ff6ec7' }
    ];

    this.questSprites = [];
    this.questNodes.forEach(q => this.makeQuestNode(q));

    // Player party (bride + groom)
    this.bride = this.physics.add.image(width / 2 - 20, height - 80,
      GameState.avatars.bride || 'bride_default').setScale(3);
    this.groom = this.physics.add.image(width / 2 + 20, height - 80,
      GameState.avatars.groom || 'groom_default').setScale(3);
    this.bride.body.setCollideWorldBounds(true);
    this.groom.body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.hint = this.add.text(width / 2, height - 30,
      'Walk into a node to start a quest. Arrow keys to move.', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    // Finale unlock
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
    // path
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
      this.add.text(q.x, q.y, '✓', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#06d6a0'
      }).setOrigin(0.5);
    }

    this.add.text(q.x, q.y + 40, q.label, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#fff',
      align: 'center',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const zone = this.add.zone(q.x, q.y, 60, 60);
    this.physics.add.existing(zone, true);
    zone.questData = q;
    this.questSprites.push(zone);
  }

  checkFinale() {
    if (GameState.allQuestsComplete()) {
      const x = this.scale.width / 2;
      const y = this.scale.height / 2;
      const g = this.add.graphics();
      g.fillStyle(0xff6ec7, 1);
      g.fillCircle(x, y, 30);
      g.lineStyle(4, 0xffd166, 1);
      g.strokeCircle(x, y, 30);

      this.add.text(x, y, '♥', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#fff'
      }).setOrigin(0.5);

      this.add.text(x, y + 50, 'FINALE!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffd166',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.finaleNode = this.add.zone(x, y, 70, 70);
      this.physics.add.existing(this.finaleNode, true);
    }
  }

  update() {
    const speed = 160;
    const v = { x: 0, y: 0 };
    if (this.cursors.left.isDown)  v.x = -speed;
    if (this.cursors.right.isDown) v.x =  speed;
    if (this.cursors.up.isDown)    v.y = -speed;
    if (this.cursors.down.isDown)  v.y =  speed;

    this.bride.setVelocity(v.x, v.y);
    this.groom.setVelocity(v.x, v.y);
    // groom follows slightly offset
    this.groom.x = this.bride.x + 24;
    this.groom.y = this.bride.y;

    // Check overlap with quest nodes
    this.questSprites.forEach(z => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(
        this.bride.getBounds(), z.getBounds()
      )) {
        if (!GameState.quests[z.questData.key]) {
          this.scene.start(z.questData.scene);
        }
      }
    });

    if (this.finaleNode &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.bride.getBounds(), this.finaleNode.getBounds()
        )) {
      this.scene.start('FinaleScene');
    }
  }
}
