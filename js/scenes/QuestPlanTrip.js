// Quest 5: Plan a Trip — dialog choices that lead to a shared dream
class QuestPlanTrip extends Phaser.Scene {
  constructor() { super('QuestPlanTrip'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#264653');

    this.add.text(width / 2, 30, 'QUEST 5: PLAN A TRIP', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ff6ec7'
    }).setOrigin(0.5);

    // Steps
    this.steps = [
      {
        prompt: 'Where to first?',
        choices: [
          { text: 'Mountains',  next: 'Bring hiking boots!' },
          { text: 'Beach',      next: 'Don\'t forget sunscreen!' },
          { text: 'City',       next: 'Walking shoes ready!' }
        ]
      },
      {
        prompt: 'How will you travel?',
        choices: [
          { text: 'Train',  next: 'Window seats reserved!' },
          { text: 'Plane',  next: 'Boarding passes printed!' },
          { text: 'Road trip', next: 'Playlist queued!' }
        ]
      },
      {
        prompt: 'What\'s the must-do?',
        choices: [
          { text: 'Try local food',  next: 'Belly happy!' },
          { text: 'Watch sunrise',   next: 'Hearts full!' },
          { text: 'Take 100 photos', next: 'Memories captured!' }
        ]
      }
    ];

    this.stepIndex = 0;
    this.path = [];

    this.promptText = this.add.text(width / 2, 110, '', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#fff',
      align: 'center', wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    this.responseText = this.add.text(width / 2, 170, '', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffd166',
      align: 'center', wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    this.choiceTexts = [];
    this.renderStep();
  }

  renderStep() {
    if (this.stepIndex >= this.steps.length) return this.win();
    const step = this.steps[this.stepIndex];
    this.promptText.setText(step.prompt);
    this.choiceTexts.forEach(t => t.destroy());
    this.choiceTexts = [];

    step.choices.forEach((c, i) => {
      const t = this.add.text(this.scale.width / 2, 250 + i * 50,
        `> ${c.text}`, {
        fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#fff',
        backgroundColor: '#ff6ec7', padding: { x: 12, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      t.on('pointerover', () => t.setColor('#ffd166'));
      t.on('pointerout',  () => t.setColor('#fff'));
      t.on('pointerdown', () => {
        this.path.push(c.text);
        this.responseText.setText(c.next);
        this.stepIndex++;
        this.time.delayedCall(900, () => this.renderStep());
      });
      this.choiceTexts.push(t);
    });
  }

  win() {
    this.choiceTexts.forEach(t => t.destroy());
    this.promptText.setText('YOUR ADVENTURE AWAITS!');
    this.responseText.setText(this.path.join(' • '));

    this.add.text(this.scale.width / 2, this.scale.height - 80,
      '♥ Together, anywhere ♥', {
      fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ff6ec7'
    }).setOrigin(0.5);

    GameState.quests.planTrip = true;
    this.time.delayedCall(2000, () => this.scene.start('OverworldScene'));
  }
}
