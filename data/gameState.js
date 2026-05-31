const STORAGE_KEY = "marriage-quest-save-v1";

const GameState = {
  quests: {
    sockMonster: false,
    coffeeCups: false,
    weddingRing: false,
    cookTogether: false,
    planTrip: false,
    vows: false,
    dance: false,
    photoAlbum: false,
    garden: false,
    cake: false,
  },
  avatars: {
    bride: null,
    groom: null,
  },
  vow: null,
  allQuestsComplete() {
    return Object.values(this.quests).every((v) => v === true);
  },
  reset() {
    Object.keys(this.quests).forEach((k) => (this.quests[k] = false));
    this.vow = null;
    this.save();
  },
  save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          quests: this.quests,
          vow: this.vow,
        })
      );
    } catch (e) {}
  },
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.quests) {
        Object.keys(this.quests).forEach((k) => {
          if (typeof data.quests[k] === "boolean") this.quests[k] = data.quests[k];
        });
      }
      if (data && typeof data.vow === "string") this.vow = data.vow;
    } catch (e) {}
  },
};

GameState.load();
