class AvatarScene extends Phaser.Scene {
  constructor() {
    super('AvatarScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 50, 'CREATE YOUR HEROES', {
      fontFamily: '"Press Start 2P"',
      fontSize: '22px',
      color: '#ff6ec7'
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'Upload photos — we will pixelate them!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#fff'
    }).setOrigin(0.5);

    this.createSlot('bride', 'BRIDE',  width * 0.28, height * 0.5, '#ff6ec7');
    this.createSlot('groom', 'GROOM',  width * 0.72, height * 0.5, '#06d6a0');

    this.continueBtn = this.add.text(width / 2, height - 60, '> SKIP / CONTINUE >', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#fff',
      backgroundColor: '#444',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.continueBtn.on('pointerdown', () => this.scene.start('OverworldScene'));

    this.events.on('shutdown', () => this.cleanupInputs());
  }

  createSlot(role, label, x, y, color) {
    const colorInt = Phaser.Display.Color.HexStringToColor(color).color;

    const frame = this.add.graphics();
    frame.lineStyle(4, colorInt, 1);
    frame.strokeRect(x - 80, y - 80, 160, 160);

    // Default placeholder sprite
    this.makePlaceholder(role + '_default', color);
    const sprite = this.add.image(x, y, role + '_default').setScale(4);
    GameState.avatars[role] = role + '_default';

    this.add.text(x, y + 100, label, {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: color
    }).setOrigin(0.5);

    const uploadBtn = this.add.text(x, y + 130, '[ UPLOAD PHOTO ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#fff',
      backgroundColor: '#222',
      padding: { x: 8, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    if (!this._inputs) this._inputs = [];
    this._inputs.push(input);

    uploadBtn.on('pointerdown', () => input.click());

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.pixelateAndApply(ev.target.result, role, sprite);
      };
      reader.readAsDataURL(file);
    });
  }

  pixelateAndApply(dataUrl, role, sprite) {
    const img = new Image();
    img.onload = () => {
      const TARGET = 32; // 32x32 pixelated sprite
      const off = document.createElement('canvas');
      off.width = TARGET;
      off.height = TARGET;
      const ctx = off.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Crop to square (center) before downsampling
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, TARGET, TARGET);

      const key = role + '_avatar_' + Date.now();
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, off);

      sprite.setTexture(key);
      GameState.avatars[role] = key;
    };
    img.src = dataUrl;
  }

  makePlaceholder(key, color) {
    if (this.textures.exists(key)) return;
    const colorInt = Phaser.Display.Color.HexStringToColor(color).color;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // simple 16x16 pixel character
    g.fillStyle(0x000000, 0); // transparent base
    g.fillRect(0, 0, 16, 16);
    // head
    g.fillStyle(0xffd1a4, 1);
    g.fillRect(5, 2, 6, 5);
    // hair
    g.fillStyle(0x4a2c2a, 1);
    g.fillRect(4, 1, 8, 2);
    // body
    g.fillStyle(colorInt, 1);
    g.fillRect(4, 7, 8, 6);
    // legs
    g.fillStyle(0x2a3a4a, 1);
    g.fillRect(5, 13, 2, 3);
    g.fillRect(9, 13, 2, 3);
    // eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(6, 4, 1, 1);
    g.fillRect(9, 4, 1, 1);
    g.generateTexture(key, 16, 16);
    g.destroy();
  }

  cleanupInputs() {
    if (this._inputs) {
      this._inputs.forEach(i => i.remove());
      this._inputs = [];
    }
  }
}
