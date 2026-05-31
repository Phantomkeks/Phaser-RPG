// Quest 4: Cook Together — match ingredients to the recipe in order
class QuestCookTogether extends Phaser.Scene {
  constructor() { super('QuestCookTogether'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#3a2618');

    this.add.text(width / 2, 30, 'QUEST 4: COOK TOGETHER', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#06d6a0'
    }).setOrigin(0.5);

    this.add.text(width / 2, 60, 'Click ingredients in the right order!', {
      fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#fff'
    }).setOrigin(0.5);

    this.makeTextures();

    // Recipe: order matters
    this.recipe = ['tomato', 'onion', 'pasta', 'cheese', 'herb'];
    this.step = 0;

    // Display recipe as a checklist
    this.recipeLabels = {};
    this.recipe.forEach((ing, i) => {
      const label = this.add.text(width / 2, 100 + i * 22,
        `${i + 1}. ${ing.toUpperCase()}`, {
        fontFamily: '"Press Start 2P"', fontSize: '11px', color: '#fff'
      }).setOrigin(0.5);
      this.recipeLabels[ing] = label;
    });

    // Pot
    const pot = this.add.graphics();
    pot.fillStyle(0x4a4e69, 1);
    pot.fillRoundedRect(width / 2 - 60, height - 200, 120, 60, 8);
    this.add.text(width / 2, height - 170, 'POT', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#fff'
    }).setOrigin(0.5);

    // Ingredients laid out (shuffled)
    const layout = Phaser.Utils.Array.Shuffle([...this.recipe]);
    layout.forEach((ing, i) => {
      const x = 100 + i * 130;
      const y = height - 80;
      const sprite = this.add.image(x, y, ing).setScale(4)
        .setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.pickIngredient(ing, sprite));
    });

    this.feedback = this.add.text(width / 2, height - 30, '', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd166'
    }).setOrigin(0.5);
  }

  pickIngredient(ing, sprite) {
    const expected = this.recipe[this.step];
    if (ing === expected) {
      this.recipeLabels[ing].setColor('#06d6a0');
      this.recipeLabels[ing].setText('✓ ' + this.recipeLabels[ing].text);
      this.tweens.add({
        targets: sprite, y: this.scale.height - 170,
        x: this.scale.width / 2, duration: 400, ease: 'Cubic.easeIn',
        onComplete: () => sprite.destroy()
      });
      this.feedback.setText('Yum!');
      this.step++;
      if (this.step >= this.recipe.length) this.win();
    } else {
      this.feedback.setText('Not yet — check the recipe!');
      this.cameras.main.shake(150, 0.005);
    }
  }

  win() {
    this.feedback.setText('DINNER IS SERVED! ♥').setColor('#06d6a0');
    GameState.quests.cookTogether = true;
    this.time.delayedCall(1500, () => this.scene.start('OverworldScene'));
  }

  makeTextures() {
    const make = (key, draw) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, 16, 16);
      g.destroy();
    };
    make('tomato', g => {
      g.fillStyle(0xef476f, 1); g.fillRect(3, 4, 10, 10);
      g.fillStyle(0x06d6a0, 1); g.fillRect(7, 2, 2, 3);
    });
    make('onion', g => {
      g.fillStyle(0xfaf3dd, 1); g.fillRect(4, 5, 8, 9);
      g.fillStyle(0xc8b88a, 1); g.fillRect(4, 6, 8, 1);
      g.fillRect(4, 9, 8, 1);
    });
    make('pasta', g => {
      g.fillStyle(0xffd166, 1);
      g.fillRect(3, 6, 10, 1); g.fillRect(3, 8, 10, 1); g.fillRect(3, 10, 10, 1);
    });
    make('cheese', g => {
      g.fillStyle(0xffe066, 1); g.fillRect(2, 5, 12, 8);
      g.fillStyle(0xff9c00, 1); g.fillRect(4, 7, 2, 2); g.fillRect(9, 9, 2, 2);
    });
    make('herb', g => {
      g.fillStyle(0x52b788, 1); g.fillRect(7, 2, 2, 12);
      g.fillRect(4, 5, 8, 2); g.fillRect(4, 9, 8, 2);
    });
  }
}
