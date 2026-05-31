class AvatarScene extends BaseScene {
  constructor() {
    super("AvatarScene");
  }

  create() {
    const { width, height } = this.scale;
    const sx = width / 800;
    const sy = height / 600;
    const s = Math.min(sx, sy);
    this._inputs = [];

    this.add.text(width / 2, 50 * sy, "CREATE YOUR HEROES", THEME.text.header).setOrigin(0.5);

    this.add
      .text(width / 2, 90 * sy, "Upload photos — we will pixelate them!", {
        ...THEME.text.small,
        fontSize: "10px",
      })
      .setOrigin(0.5);

    this.createSlot("bride", "BRIDE", width * 0.28, height * 0.5, THEME.colors.pink, s);
    this.createSlot("groom", "GROOM", width * 0.72, height * 0.5, THEME.colors.mint, s);

    this.addButton(width / 2, height - 60 * sy, "> SKIP / CONTINUE >", () => this.scene.start("OverworldScene"), {
      ...THEME.text.button,
      backgroundColor: "#444",
    });

    this.events.once("shutdown", () => this.cleanupInputs());
    this.events.once("destroy", () => this.cleanupInputs());
  }

  createSlot(role, label, x, y, color, s = 1) {
    const colorInt = Phaser.Display.Color.HexStringToColor(color).color;
    const frameSize = 160 * s;
    const half = frameSize / 2;

    const frame = this.add.graphics();
    frame.lineStyle(4, colorInt, 1);
    frame.strokeRect(x - half, y - half, frameSize, frameSize);

    this.makePlaceholder(role + "_default", color);
    const sprite = this.add.image(x, y, role + "_default").setScale(4 * s);
    GameState.avatars[role] = role + "_default";

    this.add
      .text(x, y + 100 * s, label, {
        ...THEME.text.subtitle,
        color,
      })
      .setOrigin(0.5);

    const uploadBtn = this.addButton(x, y + 130 * s, "[ UPLOAD PHOTO ]", () => input.click(), THEME.text.buttonSm);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    this._inputs.push(input);

    input.addEventListener("change", (e) => {
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
      // Match the placeholder size (16x16) so photo avatars and defaults
      // render at the same size everywhere they appear.
      const TARGET = 16;
      const off = document.createElement("canvas");
      off.width = TARGET;
      off.height = TARGET;
      const ctx = off.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, TARGET, TARGET);

      const key = role + "_avatar_" + Date.now();
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
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0xffd1a4, 1);
    g.fillRect(5, 2, 6, 5);
    g.fillStyle(0x4a2c2a, 1);
    g.fillRect(4, 1, 8, 2);
    g.fillStyle(colorInt, 1);
    g.fillRect(4, 7, 8, 6);
    g.fillStyle(0x2a3a4a, 1);
    g.fillRect(5, 13, 2, 3);
    g.fillRect(9, 13, 2, 3);
    g.fillStyle(0x000000, 1);
    g.fillRect(6, 4, 1, 1);
    g.fillRect(9, 4, 1, 1);
    g.generateTexture(key, 16, 16);
    g.destroy();
  }

  cleanupInputs() {
    if (!this._inputs) return;
    this._inputs.forEach((i) => i.remove());
    this._inputs = [];
  }
}
