// Quest 3: Find the Wedding Ring — warmer/colder hunt.
// One of the decoys secretly hides the ring; clicks on others give a warmth hint.
class QuestWeddingRing extends BaseScene {
  constructor() { super('QuestWeddingRing'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1d3557');
    this.enableEscToOverworld();

    this.addQuestTitle('QUEST 3: FIND THE RING', THEME.colors.gold);
    this.addSubtitle('Click around. Things will feel warmer as you get close.', 60);

    this.makeTextures();

    const decoyKinds = ['book', 'pillow', 'shoe', 'plant', 'mug', 'sock'];
    const positions = this.scatterPositions(15, {
      xMin: 80, xMax: width - 80, yMin: 120, yMax: height - 90, minDist: 70
    });

    // Ring is hidden at one of the decoy positions (no separate sprite).
    const ringPos = Phaser.Utils.Array.GetRandom(positions);
    this.ringX = ringPos.x;
    this.ringY = ringPos.y;
    this.ringFound = false;
    this.clicks = 0;

    // Max sensible distance on the play field — used to normalize warmth.
    this.maxDist = Phaser.Math.Distance.Between(0, 120, width, height);

    positions.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(decoyKinds);
      const obj = this.add.image(pos.x, pos.y, key)
        .setScale(4).setInteractive({ useHandCursor: true });
      obj.on('pointerdown', () => this.inspect(obj, pos));
    });

    this.statusText = this.add.text(width / 2, height - 60,
      'Tap things to inspect them...', {
        ...THEME.text.body, color: THEME.colors.gold
      }).setOrigin(0.5);

    this.clickText = this.add.text(20, 20, 'CLICKS: 0', THEME.text.hud);

    // Idle nudge: if the player hasn't clicked anything for 8s, show a small hint.
    this.idleNudge = this.time.delayedCall(8000, () => {
      if (this.clicks === 0 && !this.ringFound) {
        this.statusText.setText('Hint: a click somewhere will tell you how close you are.');
      }
    });
  }

  inspect(obj, pos) {
    if (this.ringFound) return;
    this.idleNudge.remove();
    this.clicks++;
    this.clickText.setText('CLICKS: ' + this.clicks);

    const dist = Phaser.Math.Distance.Between(pos.x, pos.y, this.ringX, this.ringY);

    // Tile that hides the ring: its center is the ring's center, so dist === 0.
    if (dist < 1) { this.foundRing(obj); return; }

    const warmth = this.warmthFor(dist);
    this.statusText.setText(warmth.label).setColor(warmth.color);

    // Persistent visual breadcrumb so the player can scan colors at a glance.
    obj.setTint(warmth.tintInt);
    obj.disableInteractive();
    this.tweens.add({
      targets: obj, scale: 4.6, duration: 80, yoyo: true,
      onComplete: () => obj.setAlpha(0.6)
    });
  }

  warmthFor(dist) {
    const ratio = Phaser.Math.Clamp(dist / this.maxDist, 0, 1);
    // 5 bands; smaller ratio = closer = hotter.
    if (ratio < 0.15) return { label: 'BURNING! ♥',         color: '#ff3b3b', tintInt: 0xff3b3b };
    if (ratio < 0.30) return { label: 'Hot!',                color: '#ff6ec7', tintInt: 0xff6ec7 };
    if (ratio < 0.50) return { label: 'Warm.',               color: '#ffd166', tintInt: 0xffd166 };
    if (ratio < 0.75) return { label: 'Cold.',               color: '#7ec8ff', tintInt: 0x7ec8ff };
    return                   { label: 'ICE COLD.',           color: '#cfefff', tintInt: 0xcfefff };
  }

  foundRing(decoy) {
    this.ringFound = true;
    this.statusText.setText('YOU FOUND THE RING! ♥').setColor(THEME.colors.gold);

    // Reveal: the decoy lifts/fades to expose the ring underneath.
    const ring = this.add.image(this.ringX, this.ringY, 'ring').setScale(4).setAlpha(0);
    this.tweens.add({
      targets: decoy, y: decoy.y - 30, alpha: 0, duration: 500,
      onComplete: () => decoy.destroy()
    });
    this.tweens.add({
      targets: ring, alpha: 1, scale: 8, duration: 700, ease: 'Bounce', delay: 200,
      onComplete: () => {
        GameState.quests.weddingRing = true;
        GameState.save();
        this.time.delayedCall(900, () => this.scene.start('OverworldScene'));
      }
    });
  }

  // Place `count` non-overlapping points within the bounds; falls back if it can't fit.
  scatterPositions(count, { xMin, xMax, yMin, yMax, minDist }) {
    const placed = [];
    let attempts = 0;
    while (placed.length < count && attempts < count * 50) {
      attempts++;
      const p = {
        x: Phaser.Math.Between(xMin, xMax),
        y: Phaser.Math.Between(yMin, yMax)
      };
      if (placed.every(q => Phaser.Math.Distance.Between(p.x, p.y, q.x, q.y) >= minDist)) {
        placed.push(p);
      }
    }
    return placed;
  }

  makeTextures() {
    const make = (key, draw) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      draw(g);
      g.generateTexture(key, 16, 16);
      g.destroy();
    };
    make('ring', g => {
      g.fillStyle(0xffd700, 1); g.fillRect(5, 4, 6, 6);
      g.fillStyle(0x1d3557, 1); g.fillRect(6, 5, 4, 4);
      g.fillStyle(0x06d6a0, 1); g.fillRect(7, 2, 2, 2);
    });
    make('book', g => {
      g.fillStyle(0x9d0208, 1); g.fillRect(3, 3, 10, 10);
      g.fillStyle(0xffd166, 1); g.fillRect(4, 5, 8, 1); g.fillRect(4, 8, 8, 1);
    });
    make('pillow', g => {
      g.fillStyle(0xff6ec7, 1); g.fillRect(2, 5, 12, 6);
      g.fillStyle(0xffffff, 1); g.fillRect(4, 7, 2, 2);
    });
    make('shoe', g => {
      g.fillStyle(0x4a4e69, 1); g.fillRect(2, 9, 12, 4); g.fillRect(8, 6, 6, 4);
    });
    make('plant', g => {
      g.fillStyle(0x9c6644, 1); g.fillRect(5, 11, 6, 3);
      g.fillStyle(0x06d6a0, 1); g.fillRect(4, 4, 8, 7);
    });
    make('mug', g => {
      g.fillStyle(0x118ab2, 1); g.fillRect(4, 5, 7, 8); g.fillRect(11, 7, 2, 4);
    });
    make('sock', g => {
      g.fillStyle(0xffffff, 1); g.fillRect(5, 3, 4, 8); g.fillRect(5, 11, 7, 3);
      g.fillStyle(0xff6ec7, 1); g.fillRect(5, 5, 4, 1);
    });
  }
}
