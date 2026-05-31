// Quest 3: Find the Wedding Ring — click hidden objects to reveal the ring
class QuestWeddingRing extends Phaser.Scene {
  constructor() { super('QuestWeddingRing'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1d3557');

    this.add.text(width / 2, 30, 'QUEST 3: FIND THE RING', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffd166'
    }).setOrigin(0.5);

    this.add.text(width / 2, 60, 'The ring is hidden! Click objects to search.', {
      fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#fff'
    }).setOrigin(0.5);

    this.makeTextures();

    // Place a bunch of decoy objects + 1 ring
    const objects = ['book', 'pillow', 'shoe', 'plant', 'mug', 'sock'];
    const positions = [];
    for (let i = 0; i < 10; i++) {
      positions.push({
        x: Phaser.Math.Between(80, width - 80),
        y: Phaser.Math.Between(120, height - 80)
      });
    }

    // Pick a random spot for the ring
    const ringIndex = Phaser.Math.Between(0, positions.length - 1);

    positions.forEach((pos, i) => {
      const isRing = i === ringIndex;
      const key = isRing ? 'ring' : Phaser.Utils.Array.GetRandom(objects);
      const obj = this.add.image(pos.x, pos.y, key)
        .setScale(4).setInteractive({ useHandCursor: true });

      obj.on('pointerdown', () => {
        if (isRing) this.found(obj);
        else {
          this.tweens.add({
            targets: obj, scale: 5, duration: 100, yoyo: true
          });
          obj.setTint(0x666666);
          this.time.delayedCall(300, () => obj.clearTint());
        }
      });
    });

    this.statusText = this.add.text(width / 2, height - 40,
      'Tap things to inspect them...', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd166'
    }).setOrigin(0.5);
  }

  found(ringObj) {
    this.statusText.setText('YOU FOUND THE RING! ♥');
    this.tweens.add({
      targets: ringObj, scale: 8, duration: 500, ease: 'Bounce',
      onComplete: () => {
        GameState.quests.weddingRing = true;
        this.time.delayedCall(1000, () => this.scene.start('OverworldScene'));
      }
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
    make('ring', g => {
      g.fillStyle(0xffd700, 1); g.fillRect(5, 4, 6, 6);
      g.fillStyle(0x1d3557, 1); g.fillRect(6, 5, 4, 4);
      g.fillStyle(0x06d6a0, 1); g.fillRect(7, 2, 2, 2);
    });
    make('book', g => {
      g.fillStyle(0x9d0208, 1); g.fillRect(3, 3, 10, 10);
      g.fillStyle(0xffd166, 1); g.fillRect(4, 5, 8, 1);
      g.fillRect(4, 8, 8, 1);
    });
    make('pillow', g => {
      g.fillStyle(0xff6ec7, 1); g.fillRect(2, 5, 12, 6);
      g.fillStyle(0xffffff, 1); g.fillRect(4, 7, 2, 2);
    });
    make('shoe', g => {
      g.fillStyle(0x4a4e69, 1); g.fillRect(2, 9, 12, 4);
      g.fillRect(8, 6, 6, 4);
    });
    make('plant', g => {
      g.fillStyle(0x9c6644, 1); g.fillRect(5, 11, 6, 3);
      g.fillStyle(0x06d6a0, 1); g.fillRect(4, 4, 8, 7);
    });
    make('mug', g => {
      g.fillStyle(0x118ab2, 1); g.fillRect(4, 5, 7, 8);
      g.fillRect(11, 7, 2, 4);
    });
    make('sock', g => {
      g.fillStyle(0xffffff, 1); g.fillRect(5, 3, 4, 8);
      g.fillRect(5, 11, 7, 3);
      g.fillStyle(0xff6ec7, 1); g.fillRect(5, 5, 4, 1);
    });
  }
}
