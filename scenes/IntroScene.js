class IntroScene extends BaseScene {
  constructor() {
    super("IntroScene");
  }

  create() {
    const { width, height } = this.scale;

    this.pages = [
      "Once upon a pixel, in a kingdom of\nshared coffee mugs and tangled\nheadphones, two heroes met...",
      "They battled lost socks, conquered\nMonday mornings, and survived IKEA\ntogether. Love leveled up.",
      "Now their greatest quest awaits:\nTHE WEDDING. But the path is long,\nand many side-quests stand in the way.",
      "Rescue the cake. Write the vows.\nFind the ring. Plant a garden.\nDance like nobody is watching.",
      "Complete every quest, and unlock\nthe finale: two hearts, one forever.\n\nPress START to begin your adventure.",
    ];

    this.pageIndex = 0;

    this.add
      .text(width / 2, 50, "~ THE LEGEND BEGINS ~", {
        ...THEME.text.subtitle,
        color: THEME.colors.pink,
      })
      .setOrigin(0.5);

    const boxX = 60;
    const boxY = 130;
    const boxW = width - 120;
    const boxH = 280;
    const box = this.add.graphics();
    box.fillStyle(0x000000, 0.6);
    box.fillRect(boxX, boxY, boxW, boxH);
    box.lineStyle(3, Phaser.Display.Color.HexStringToColor(THEME.colors.gold).color, 1);
    box.strokeRect(boxX, boxY, boxW, boxH);

    this.storyText = this.add.text(width / 2, boxY + boxH / 2, "", {
      ...THEME.text.body,
      fontSize: "14px",
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5);

    this.hint = this.add
      .text(width / 2, boxY + boxH + 30, "[ click / SPACE for next ]", {
        ...THEME.text.tiny,
        color: THEME.colors.gray,
      })
      .setOrigin(0.5);

    this.skipBtn = this.addButton(
      width - 80,
      height - 30,
      "SKIP >>",
      () => this.goNext(),
      { ...THEME.text.buttonSm }
    );

    this.input.on("pointerdown", (_p, targets) => {
      if (targets && targets.includes(this.skipBtn)) return;
      this.advance();
    });
    this.input.keyboard.on("keydown-SPACE", () => this.advance());
    this.input.keyboard.on("keydown-ENTER", () => this.advance());
    this.input.keyboard.on("keydown-ESC", () => this.goNext());

    this.showPage();
  }

  showPage() {
    this.typing = true;
    this.storyText.setText("");
    const fullText = this.pages[this.pageIndex];
    let i = 0;
    if (this.typeEvent) this.typeEvent.remove(false);
    this.typeEvent = this.time.addEvent({
      delay: 30,
      repeat: fullText.length - 1,
      callback: () => {
        this.storyText.setText(fullText.substring(0, ++i));
        if (i >= fullText.length) this.typing = false;
      },
    });
  }

  advance() {
    if (this.typing) {
      if (this.typeEvent) this.typeEvent.remove(false);
      this.storyText.setText(this.pages[this.pageIndex]);
      this.typing = false;
      return;
    }
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      this.goNext();
      return;
    }
    this.showPage();
  }

  goNext() {
    this.scene.start("AvatarScene");
  }
}
