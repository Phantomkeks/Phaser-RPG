// Quest 7: Dance Together — Simon Says with arrow keys.
// Three rounds; each round shows a longer sequence than the last.
class QuestDance extends BaseScene {
  constructor() {
    super("QuestDance");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#1f1147");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 7: DANCE TOGETHER", THEME.colors.pink);
    this.addSubtitle("Repeat the steps. Use the arrow keys.", 60);

    // Avatars side by side, centered.
    const groundY = height * 0.55;
    this.bride = this.add.image(width / 2 - 50, groundY, GameState.avatars.bride || "bride_default").setScale(4);
    this.groom = this.add.image(width / 2 + 50, groundY, GameState.avatars.groom || "groom_default").setScale(4);

    // Arrow display row.
    this.arrowRow = this.add
      .text(width / 2, height * 0.78, "", {
        ...THEME.text.questHeader,
        fontSize: "32px",
        color: THEME.colors.gold,
        align: "center",
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(width / 2, height - 60, "", {
        ...THEME.text.body,
        color: THEME.colors.white,
      })
      .setOrigin(0.5);

    this.rounds = [3, 4, 5];
    this.roundIndex = 0;
    this.acceptingInput = false;
    this.expected = [];
    this.inputCursor = 0;

    // Buffer keys so we can ignore until playback finishes.
    this.input.keyboard.on("keydown", (e) => {
      if (!this.acceptingInput) return;
      const k = this.keyToDir(e.key);
      if (!k) return;
      this.handleStep(k);
    });

    this.time.delayedCall(800, () => this.startRound());
  }

  keyToDir(key) {
    if (key === "ArrowLeft") return "L";
    if (key === "ArrowRight") return "R";
    if (key === "ArrowUp") return "U";
    if (key === "ArrowDown") return "D";
    return null;
  }

  arrowChar(dir) {
    return { L: "◀", R: "▶", U: "▲", D: "▼" }[dir];
  }

  startRound() {
    const len = this.rounds[this.roundIndex];
    this.expected = Array.from({ length: len }, () => Phaser.Utils.Array.GetRandom(["L", "R", "U", "D"]));
    this.inputCursor = 0;
    this.statusText.setText(`Round ${this.roundIndex + 1} of ${this.rounds.length} — watch...`);
    this.playSequence();
  }

  playSequence() {
    this.acceptingInput = false;
    this.arrowRow.setText("");
    let i = 0;
    const speed = Math.max(380, 700 - this.roundIndex * 120);
    const tick = () => {
      if (i >= this.expected.length) {
        this.statusText.setText("Your turn!");
        this.arrowRow.setText("_".repeat(this.expected.length).split("").join(" "));
        this.acceptingInput = true;
        this.bopAvatars();
        return;
      }
      const dir = this.expected[i];
      this.arrowRow.setText(this.arrowChar(dir));
      this.bop(dir === "L" ? this.bride : this.groom);
      i++;
      this.time.delayedCall(speed, tick);
    };
    tick();
  }

  handleStep(dir) {
    if (dir === this.expected[this.inputCursor]) {
      this.inputCursor++;
      this.bop(this.inputCursor % 2 === 0 ? this.groom : this.bride);
      const shown = this.expected.slice(0, this.inputCursor).map((d) => this.arrowChar(d));
      const remaining = "_"
        .repeat(this.expected.length - this.inputCursor)
        .split("")
        .map(() => "_");
      this.arrowRow.setText([...shown, ...remaining].join(" "));

      if (this.inputCursor >= this.expected.length) {
        this.acceptingInput = false;
        this.roundIndex++;
        if (this.roundIndex >= this.rounds.length) {
          this.win();
        } else {
          this.statusText.setText("Nice! Next round...");
          this.time.delayedCall(900, () => this.startRound());
        }
      }
    } else {
      this.acceptingInput = false;
      this.statusText.setText("Out of step! Try again.");
      this.cameras.main.shake(180, 0.006);
      this.time.delayedCall(900, () => this.startRound());
    }
  }

  bop(target) {
    this.tweens.add({
      targets: target,
      y: target.y - 8,
      duration: 120,
      yoyo: true,
    });
  }

  bopAvatars() {
    this.bop(this.bride);
    this.time.delayedCall(120, () => this.bop(this.groom));
  }

  win() {
    this.statusText.setText("PERFECT DANCE! ♥").setColor(THEME.colors.mint);
    this.arrowRow.setText("♥ ♥ ♥");
    GameState.quests.dance = true;
    GameState.save();
    this.time.delayedCall(1700, () => this.scene.start("OverworldScene"));
  }
}
