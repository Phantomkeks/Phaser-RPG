// Quest 5: Plan a Trip — dialog choices that lead to a shared dream
class QuestPlanTrip extends BaseScene {
  constructor() { super('QuestPlanTrip'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#264653');
    this.enableEscToOverworld();

    this.addQuestTitle('QUEST 5: PLAN A TRIP', THEME.colors.pink);

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
          { text: 'Train',     next: 'Window seats reserved!' },
          { text: 'Plane',     next: 'Boarding passes printed!' },
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
      ...THEME.text.questHeader, color: THEME.colors.white,
      align: 'center', wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    this.responseText = this.add.text(width / 2, 170, '', {
      ...THEME.text.body, color: THEME.colors.gold,
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
      const t = this.addButton(this.scale.width / 2, 250 + i * 50, `> ${c.text}`,
        () => {
          this.path.push(c.text);
          this.responseText.setText(c.next);
          this.stepIndex++;
          this.time.delayedCall(900, () => this.renderStep());
        },
        { ...THEME.text.button, fontSize: '12px', padding: { x: 12, y: 8 } }
      );
      t.on('pointerover', () => t.setColor(THEME.colors.gold));
      t.on('pointerout',  () => t.setColor(THEME.colors.white));
      this.choiceTexts.push(t);
    });
  }

  win() {
    this.choiceTexts.forEach(t => t.destroy());
    this.promptText.setText('YOUR ADVENTURE AWAITS!');
    this.responseText.setText(this.path.join(' • '));

    this.add.text(this.scale.width / 2, this.scale.height - 80,
      '♥ Together, anywhere ♥', {
        ...THEME.text.hud, color: THEME.colors.pink
      }).setOrigin(0.5);

    GameState.quests.planTrip = true;
    GameState.save();
    this.time.delayedCall(2000, () => this.scene.start('OverworldScene'));
  }
}
