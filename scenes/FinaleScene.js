// FinaleScene — unlocks after all quests; shows the couple's vow + friends' messages
class FinaleScene extends BaseScene {
  constructor() { super('FinaleScene'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1a0a2e');

    this.hearts = this.add.group();
    this.heartTimer = this.time.addEvent({
      delay: 200, loop: true, callback: () => this.spawnHeart()
    });
    this.events.once('shutdown', () => this.heartTimer && this.heartTimer.remove());

    this.add.text(width / 2, 50, '♥ CONGRATULATIONS! ♥', {
      ...THEME.text.title, fontSize: '20px', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'You completed every quest together.', {
      ...THEME.text.body, color: THEME.colors.gold
    }).setOrigin(0.5);

    this.add.image(60, 60, GameState.avatars.bride || 'bride_default').setScale(3);
    this.add.image(width - 60, 60, GameState.avatars.groom || 'groom_default').setScale(3);

    // The vow they wrote together — shown above the friends' messages.
    let messageStartY = 160;
    if (GameState.vow) {
      const vowLabel = this.add.text(width / 2, 145, '~ Your Vow ~', {
        ...THEME.text.body, color: THEME.colors.pink
      }).setOrigin(0.5);
      const vowText = this.add.text(width / 2, 170, '"' + GameState.vow + '"', {
        ...THEME.text.small, color: THEME.colors.gold,
        align: 'center', wordWrap: { width: width - 100 }, lineSpacing: 4
      }).setOrigin(0.5, 0);
      messageStartY = 175 + vowText.height + 25;
      this.add.text(width / 2, messageStartY - 18,
        'Messages from those who love you:', THEME.text.small).setOrigin(0.5);
    } else {
      this.add.text(width / 2, 115, 'Messages from those who love you:', THEME.text.small)
        .setOrigin(0.5);
    }

    this.msgTopStart = messageStartY;
    this.msgY = this.msgTopStart;
    this.msgIndex = 0;
    this.messageTexts = [];
    this.scrollOffset = 0;

    this.revealNext();

    this.hint = this.add.text(width / 2, height - 25,
      'SPACE for next message', {
        ...THEME.text.tiny
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
      ...THEME.text.body, fontSize: '11px', color: m.color || THEME.colors.gold
    }).setOrigin(0.5).setAlpha(0);

    const bodyText = this.add.text(x, y + 22, m.text, {
      ...THEME.text.small, align: 'center',
      wordWrap: { width: this.scale.width - 100 }, lineSpacing: 4
    }).setOrigin(0.5, 0).setAlpha(0);

    this.tweens.add({ targets: [fromText, bodyText], alpha: 1, duration: 600 });

    this.messageTexts.push(fromText, bodyText);
    this.msgY += 30 + bodyText.height + 15;
  }

  showFinalCard() {
    if (this.finalShown) return;
    this.finalShown = true;
    this.hint.setText('♥ THE END ♥ — Live happily ever after.');
    this.hint.setColor(THEME.colors.pink);
  }

  // Clamp scroll so messages can't fly off forever in either direction.
  scrollMessages(dy) {
    const contentBottom = this.msgY;
    const visibleBottom = this.scale.height - 60;
    const maxUp = Math.max(0, contentBottom - visibleBottom);
    const next = Phaser.Math.Clamp(this.scrollOffset + dy, -maxUp, 0);
    const applied = next - this.scrollOffset;
    if (applied === 0) return;
    this.messageTexts.forEach(t => { t.y += applied; });
    this.scrollOffset = next;
  }

  spawnHeart() {
    const x = Phaser.Math.Between(0, this.scale.width);
    const heart = this.add.text(x, -20, '♥', {
      fontFamily: THEME.font,
      fontSize: Phaser.Math.Between(10, 18) + 'px',
      color: Phaser.Utils.Array.GetRandom([
        THEME.colors.pink, THEME.colors.gold, THEME.colors.mint, THEME.colors.white
      ])
    }).setAlpha(0.5);
    this.tweens.add({
      targets: heart, y: this.scale.height + 20,
      duration: Phaser.Math.Between(4000, 8000),
      onComplete: () => heart.destroy()
    });
  }
}
