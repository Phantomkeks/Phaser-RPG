class TitleScene extends BaseScene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const { width, height } = this.scale;

    this.drawPixelHearts();

    this.add.text(width / 2, height / 3, 'MARRIAGE QUEST', THEME.text.title)
      .setOrigin(0.5);

    this.add.text(width / 2, height / 3 + 60, 'A Wedding Adventure', THEME.text.subtitle)
      .setOrigin(0.5);

    const startBtn = this.addButton(
      width / 2, height * 0.65, '> PRESS START <',
      () => this.scene.start('AvatarScene'),
      { ...THEME.text.button, fontSize: '20px', padding: { x: 20, y: 12 } }
    );

    this.tweens.add({
      targets: startBtn,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.add.text(width / 2, height - 30, 'Two hearts. Five quests. One forever.', {
      ...THEME.text.small, fontSize: '10px', color: THEME.colors.gray
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
    const colors = [THEME.colors.pink, THEME.colors.gold, THEME.colors.mint];
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
