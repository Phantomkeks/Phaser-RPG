class BaseScene extends Phaser.Scene {
  init() {
    // RESIZE scale mode means the canvas matches the viewport; on rotate or
    // window resize, restart the active scene so create() re-lays out for the
    // new dimensions. Debounced to avoid thrash while a desktop user drags.
    this._resizeTimer = null;
    const onResize = () => {
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        if (this.scene.isActive()) this.scene.restart();
      }, 150);
    };
    this.scale.on("resize", onResize);
    this.events.once("shutdown", () => {
      this.scale.off("resize", onResize);
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
    });
  }

  // Adds a top-of-screen quest title in the given color.
  addQuestTitle(text, color) {
    const { width } = this.scale;
    return this.add
      .text(width / 2, 30, text, {
        ...THEME.text.questHeader,
        color,
      })
      .setOrigin(0.5);
  }

  addSubtitle(text, y = 60, color = THEME.colors.white) {
    return this.add
      .text(this.scale.width / 2, y, text, {
        ...THEME.text.small,
        color,
      })
      .setOrigin(0.5);
  }

  // Pink button with hand cursor; returns the text object.
  addButton(x, y, label, onClick, style = THEME.text.button) {
    const btn = this.add.text(x, y, label, style).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on("pointerdown", onClick);
    return btn;
  }

  // True when the device reports any touch capability. Used to gate on-screen controls.
  isTouchDevice() {
    return (
      this.sys.game.device.input.touch &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }

  // Wires ESC to return to the overworld and adds an on-screen back button on touch devices.
  enableEscToOverworld() {
    const back = () => this.scene.start("OverworldScene");
    this.input.keyboard.once("keydown-ESC", back);
    if (this.isTouchDevice()) this.addBackButton(back);
  }

  // Top-right [X] button — visible exit affordance for touch users.
  addBackButton(onClick) {
    const { width } = this.scale;
    const btn = this.add
      .text(width - 16, 16, "[X]", {
        ...THEME.text.button,
        fontSize: "16px",
        backgroundColor: THEME.colors.black,
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", onClick);
    return btn;
  }

  // On-screen D-pad (bottom-left) for movement on touch devices.
  // Returns an object with a live `direction` { x, y } (each in {-1, 0, 1})
  // the caller can read each frame, mirroring how cursors work.
  createVirtualDPad() {
    const state = { direction: { x: 0, y: 0 }, buttons: [] };
    if (!this.isTouchDevice()) return state;

    const { height } = this.scale;
    const cx = 80;
    const cy = height - 90;
    const r = 26;
    const gap = 4;
    const offset = r * 2 + gap;

    const dirs = [
      { key: "up", dx: 0, dy: -1, x: cx, y: cy - offset, label: "▲" },
      { key: "down", dx: 0, dy: 1, x: cx, y: cy + offset, label: "▼" },
      { key: "left", dx: -1, dy: 0, x: cx - offset, y: cy, label: "◀" },
      { key: "right", dx: 1, dy: 0, x: cx + offset, y: cy, label: "▶" },
    ];

    const active = { up: false, down: false, left: false, right: false };
    const recompute = () => {
      state.direction.x = (active.right ? 1 : 0) - (active.left ? 1 : 0);
      state.direction.y = (active.down ? 1 : 0) - (active.up ? 1 : 0);
    };

    dirs.forEach((d) => {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.55);
      g.fillCircle(0, 0, r);
      g.lineStyle(2, 0xff6ec7, 0.9);
      g.strokeCircle(0, 0, r);
      g.x = d.x;
      g.y = d.y;
      g.setScrollFactor(0).setDepth(999);

      const label = this.add
        .text(d.x, d.y, d.label, {
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000);

      // Hit zone is generous (square) so taps near the edge still register.
      const zone = this.add
        .zone(d.x, d.y, r * 2 + 8, r * 2 + 8)
        .setScrollFactor(0)
        .setDepth(1001)
        .setInteractive();

      zone.on("pointerdown", () => {
        active[d.key] = true;
        recompute();
      });
      const release = () => {
        if (!active[d.key]) return;
        active[d.key] = false;
        recompute();
      };
      zone.on("pointerup", release);
      zone.on("pointerout", release);
      zone.on("pointerupoutside", release);

      state.buttons.push({ graphic: g, label, zone });
    });

    // Releasing a touch anywhere should also clear all directions, in case
    // the pointerup event misses the zone (common when dragging off-button).
    this.input.on("pointerup", () => {
      let changed = false;
      for (const k of Object.keys(active)) {
        if (active[k]) {
          active[k] = false;
          changed = true;
        }
      }
      if (changed) recompute();
    });

    return state;
  }
}
