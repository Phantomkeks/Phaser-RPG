// Quest 1: Sock Monster — turn-based-ish click battle
class QuestSockMonster extends BaseScene {
  constructor() {
    super("QuestSockMonster");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#3d2c4a");
    this.enableEscToOverworld();

    this.addQuestTitle("QUEST 1: THE SOCK MONSTER", THEME.colors.red);
    this.addSubtitle("Defeat the laundry beast!", 75);

    // Spacing tuned so 16x16 sprites at scale 4 (64px wide) don't overlap.
    this.add.image(width * 0.22, height * 0.7, GameState.avatars.bride || "bride_default").setScale(4);
    this.add.image(width * 0.35, height * 0.7, GameState.avatars.groom || "groom_default").setScale(4);

    this.makeSockMonster();
    this.monster = this.add.image(width * 0.7, height * 0.4, "sockMonster").setScale(5);

    this.monsterHP = 5;
    this.hpText = this.add
      .text(width * 0.7, height * 0.4 - 80, `HP: ${this.monsterHP}`, {
        ...THEME.text.hud,
        color: THEME.colors.red,
      })
      .setOrigin(0.5);

    this.attackBtn = this.addButton(width / 2, height - 80, "[ TOSS A SOCK! ]", () => this.attack(), {
      ...THEME.text.button,
      backgroundColor: THEME.colors.red,
    });

    this.log = this.add
      .text(width / 2, height - 140, "A wild sock monster appears!", {
        ...THEME.text.small,
        color: THEME.colors.gold,
      })
      .setOrigin(0.5);
  }

  attack() {
    if (this.monsterHP <= 0) return;
    this.monsterHP--;
    this.hpText.setText(`HP: ${this.monsterHP}`);

    this.tweens.add({
      targets: this.monster,
      x: this.monster.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    const lines = ["Pow! A direct hit!", "Take that!", "Sock-em!", "Critical fluff!"];
    this.log.setText(Phaser.Utils.Array.GetRandom(lines));

    if (this.monsterHP <= 0) this.win();
  }

  win() {
    this.log.setText("VICTORY! The laundry is saved!");
    this.attackBtn.disableInteractive();
    this.tweens.add({
      targets: this.monster,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        GameState.quests.sockMonster = true;
        GameState.save();
        this.time.delayedCall(800, () => this.scene.start("OverworldScene"));
      },
    });
  }

  makeSockMonster() {
    if (this.textures.exists("sockMonster")) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x6c5b7b, 1);
    g.fillRect(2, 4, 12, 10);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 2, 3, 3);
    g.fillRect(13, 3, 3, 3);
    g.fillStyle(0xff6ec7, 1);
    g.fillRect(5, 1, 3, 3);
    g.fillStyle(0xffd166, 1);
    g.fillRect(5, 7, 2, 2);
    g.fillRect(9, 7, 2, 2);
    g.fillStyle(0x000000, 1);
    g.fillRect(6, 8, 1, 1);
    g.fillRect(10, 8, 1, 1);
    g.fillStyle(0x000000, 1);
    g.fillRect(6, 11, 4, 1);
    g.generateTexture("sockMonster", 16, 16);
    g.destroy();
  }
}
