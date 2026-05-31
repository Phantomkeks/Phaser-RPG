// FinaleScene — unlocks after all 5 quests; reveals friends' messages
class FinaleScene extends Phaser.Scene {
  constructor() { super('FinaleScene'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1a0a2e');

    // Falling hearts
    this.hearts = this.add.group();
    this.time.addEvent({
      delay: 200, loop: true, callback: () => this.spawnHeart()
    });

    this.add.text(width / 2, 50, '♥ CONGRATULATIONS! ♥', {
      fontFamily: '"Press Start 2P"', fontSize: '20px', color: '#ff6ec7',
      stroke: '#fff', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'You completed every quest together.', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd166'
    }).setOrigin(0.5);

    this.add.text(width / 2, 115, 'Messages from those who love you:', {
      fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#fff'
    }).setOrigin(0.5);

    // Hero portraits
    this.add.image(60, 60, GameState.avatars.bride || 'bride_default').setScale(3);
    this.add.image(width - 60, 60, GameState.avatars.groom || 'groom_default').setScale(3);

    // Scrollable messages region
    this.msgY = 160;
    this.msgIndex = 0;
    this.messageTexts = [];

    this.revealNext();

    // Hint
    this.hint = this.add.text(width / 2, height - 25,
      '↑/↓ to scroll • SPACE for next message', {
      fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#fff'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-SPACE', () => this.revealNext());
    this.input.keyboard.on('keydown-UP',   () => this.scrollMessages(40));
    this.input.keyboard.on('keydown-DOWN', () => this.scrollMessages(-40));
  }

  revealNext() {
    if (this.msgIndex >= FRIENDS_MESSAGES.length) {
      this.showFinalCard();
      return;
    }

    const m = FRIENDS_MESSAGES[this.msgIndex++];
    const x = this.scale.width / 2;
    const y = this.msgY;

    const fromText = this.add.text(x, y, '— ' + m.from + ' —', {
      fontFamily: '"Press Start 2P"', fontSize: '11px', color: m.color || '#ffd166'
    }).setOrigin(0.5).setAlpha(0);

    const bodyText = this.add.text(x, y + 22, m.text, {
      fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#fff',
      align: 'center', wordWrap: { width: this.scale.width - 100 },
      lineSpacing: 4
    }).setOrigin(0.5, 0).setAlpha(0);

    this.tweens.add({ targets: [fromText, bodyText], alpha: 1, duration: 600 });

    this.messageTexts.push(fromText, bodyText);
    this.msgY += 30 + bodyText.height + 15;
  }

  showFinalCard() {
    if (this.finalShown) return;
    this.finalShown = true;
    this.hint.setText('♥ THE END ♥ — Live happily ever after.');
    this.hint.setColor('#ff6ec7');
  }

  scrollMessages(dy) {
    this.messageTexts.forEach(t => { t.y += dy; });
    this.msgY += dy;
  }

  spawnHeart() {
    const x = Phaser.Math.Between(0, this.scale.width);
    const heart = this.add.text(x, -20, '♥', {
      fontFamily: '"Press Start 2P"', fontSize: Phaser.Math.Between(10, 18) + 'px',
      color: Phaser.Utils.Array.GetRandom(['#ff6ec7', '#ffd166', '#06d6a0', '#fff'])
    }).setAlpha(0.5);
    this.tweens.add({
      targets: heart, y: this.scale.height + 20,
      duration: Phaser.Math.Between(4000, 8000),
      onComplete: () => heart.destroy()
    });
  }
}
