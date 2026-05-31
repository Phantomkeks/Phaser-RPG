// Quest 6: Write Your Vows — fill-in-the-blanks built up choice by choice.
// Final vow is saved to GameState.vow and recited on the finale screen.
class QuestVows extends BaseScene {
  constructor() {
    super("QuestVows");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#2b1d3a");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 6: WRITE YOUR VOWS", THEME.colors.gold);
    this.addSubtitle("Pick the words from your heart.", 60);

    // Each blank: leading text, three choices, trailing text for the next blank's lead-in.
    this.blanks = [
      { lead: "I promise to ", choices: ["hold your hand", "make you laugh", "share my fries"] },
      { lead: " when you are ", choices: ["scared", "tired", "grumpy"] },
      { lead: ", to ", choices: ["dance with you", "cook for you", "listen closely"] },
      { lead: " even on ", choices: ["rainy days", "long Mondays", "forgotten birthdays"] },
      { lead: ", and to always ", choices: ["choose us", "come back home", "love you bigger"], tail: "." },
    ];

    this.stepIndex = 0;
    this.parts = [];

    this.scrollText = this.add
      .text(width / 2, 130, "", {
        ...THEME.text.body,
        color: THEME.colors.white,
        align: "center",
        wordWrap: { width: width - 100 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0);

    this.choiceTexts = [];
    this.renderStep();
  }

  vowSoFar(includeCursor) {
    let s = "";
    for (let i = 0; i <= this.stepIndex && i < this.blanks.length; i++) {
      s += this.blanks[i].lead;
      if (i < this.parts.length) s += this.parts[i];
      else if (includeCursor) s += "___";
    }
    if (this.parts.length === this.blanks.length) {
      s += this.blanks[this.blanks.length - 1].tail || "";
    }
    return s;
  }

  renderStep() {
    if (this.stepIndex >= this.blanks.length) return this.win();

    this.scrollText.setText(this.vowSoFar(true));

    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];

    const step = this.blanks[this.stepIndex];
    step.choices.forEach((choice, i) => {
      const t = this.addButton(
        this.scale.width / 2,
        320 + i * 50,
        `> ${choice}`,
        () => {
          this.parts.push(choice);
          this.stepIndex++;
          this.scrollText.setText(this.vowSoFar(this.stepIndex < this.blanks.length));
          this.choiceTexts.forEach((b) => b.disableInteractive());
          this.time.delayedCall(500, () => this.renderStep());
        },
        { ...THEME.text.button, fontSize: "11px", padding: { x: 12, y: 8 }, backgroundColor: "#6b4f8a" }
      );
      t.on("pointerover", () => t.setColor(THEME.colors.gold));
      t.on("pointerout", () => t.setColor(THEME.colors.white));
      this.choiceTexts.push(t);
    });
  }

  win() {
    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];

    const fullVow = this.vowSoFar(false);
    GameState.vow = fullVow;
    GameState.quests.vows = true;
    GameState.save();

    this.scrollText.setText(fullVow);
    this.tweens.add({
      targets: this.scrollText,
      alpha: { from: 1, to: 0.7 },
      yoyo: true,
      duration: 600,
      repeat: 2,
    });

    this.add
      .text(this.scale.width / 2, this.scale.height - 70, "♥ Sealed with a kiss ♥", {
        ...THEME.text.hud,
        color: THEME.colors.pink,
      })
      .setOrigin(0.5);

    this.time.delayedCall(2800, () => this.scene.start("OverworldScene"));
  }
}
