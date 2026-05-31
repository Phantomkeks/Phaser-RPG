class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const { width, height } = this.scale;

    // Pixelated heart background tiles
    this.drawPixelHearts();

    this.add.text(width / 2, height / 3, 'MARRIAGE QUEST', {
      fontFamily: '"Press Start 2P"',
      fontSize: '36px',
      color: '#ff6ec7',
      stroke: '#fff',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 3 + 60, 'A Wedding Adventure', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#ffd166'
    }).setOrigin(0.5);

    const startBtn = this.add.text(width / 2, height * 0.65, '> PRESS START <', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#fff',
      backgroundColor: '#ff6ec7',
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: startBtn,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    startBtn.on('pointerdown', () => {
      this.scene.start('AvatarScene');
    });

    this.add.text(width / 2, height - 30,
      'Two hearts. Five quests. One forever.', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#aaa'
    }).setOrigin(0.5);
  }

  drawPixelHearts() {
    const g = this.add.graphics();
    const heartPx = [
      [0,1,1,0,1,1,0],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
      [0,0,0,1,0,0,0],
    ];
    const colors = ['#ff6ec7', '#ffd166', '#06d6a0'];
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const c = Phaser.Display.Color.HexStringToColor(
        Phaser.Utils.Array.GetRandom(colors)
      ).color;
      g.fillStyle(c, 0.15);
      heartPx.forEach((row, ry) => {
        row.forEach((px, rx) => {
          if (px) g.fillRect(x + rx * 4, y + ry * 4, 4, 4);
        });
      });
    }
  }
}
