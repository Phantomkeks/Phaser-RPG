// Quest 1: Sock Monster — turn-based-ish click battle
class QuestSockMonster extends Phaser.Scene {
  constructor() { super('QuestSockMonster'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#3d2c4a');

    this.add.text(width / 2, 40, 'QUEST 1: THE SOCK MONSTER', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ef476f'
    }).setOrigin(0.5);

    this.add.text(width / 2, 75, 'Defeat the laundry beast!', {
      fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#fff'
    }).setOrigin(0.5);

    // Hero pair
    this.add.image(width * 0.25, height * 0.7,
      GameState.avatars.bride || 'bride_default').setScale(4);
    this.add.image(width * 0.35, height * 0.7,
      GameState.avatars.groom || 'groom_default').setScale(4);

    // Sock monster sprite (drawn)
    this.makeSockMonster();
    this.monster = this.add.image(width * 0.7, height * 0.4, 'sockMonster').setScale(5);

    // HP
    this.monsterHP = 5;
    this.hpText = this.add.text(width * 0.7, height * 0.4 - 80, `HP: ${this.monsterHP}`, {
      fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ef476f'
    }).setOrigin(0.5);

    // Attack button
    const atk = this.add.text(width / 2, height - 80, '[ TOSS A SOCK! ]', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#fff',
      backgroundColor: '#ef476f', padding: { x: 14, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    atk.on('pointerdown', () => this.attack());

    this.log = this.add.text(width / 2, height - 140, 'A wild sock monster appears!', {
      fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#ffd166'
    }).setOrigin(0.5);
  }

  attack() {
    if (this.monsterHP <= 0) return;
    this.monsterHP--;
    this.hpText.setText(`HP: ${this.monsterHP}`);

    this.tweens.add({
      targets: this.monster,
      x: this.monster.x + 10, duration: 50, yoyo: true, repeat: 3,
      onComplete: () => { this.monster.x = this.scale.width * 0.7; }
    });

    const lines = ['Pow! A direct hit!', 'Take that!', 'Sock-em!', 'Critical fluff!'];
    this.log.setText(Phaser.Utils.Array.GetRandom(lines));

    if (this.monsterHP <= 0) this.win();
  }

  win() {
    this.log.setText('VICTORY! The laundry is saved!');
    this.tweens.add({
      targets: this.monster, alpha: 0, duration: 800,
      onComplete: () => {
        GameState.quests.sockMonster = true;
        this.time.delayedCall(800, () => this.scene.start('OverworldScene'));
      }
    });
  }

  makeSockMonster() {
    if (this.textures.exists('sockMonster')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // body
    g.fillStyle(0x6c5b7b, 1); g.fillRect(2, 4, 12, 10);
    // socks sticking out
    g.fillStyle(0xffffff, 1); g.fillRect(0, 2, 3, 3); g.fillRect(13, 3, 3, 3);
    g.fillStyle(0xff6ec7, 1); g.fillRect(5, 1, 3, 3);
    // eyes
    g.fillStyle(0xffd166, 1); g.fillRect(5, 7, 2, 2); g.fillRect(9, 7, 2, 2);
    g.fillStyle(0x000000, 1); g.fillRect(6, 8, 1, 1); g.fillRect(10, 8, 1, 1);
    // mouth
    g.fillStyle(0x000000, 1); g.fillRect(6, 11, 4, 1);
    g.generateTexture('sockMonster', 16, 16);
    g.destroy();
  }
}
