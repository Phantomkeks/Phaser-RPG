const STORAGE_KEY = 'marriage-quest-save-v1';

const GameState = {
  quests: {
    sockMonster: false,
    coffeeCups: false,
    weddingRing: false,
    cookTogether: false,
    planTrip: false
  },
  avatars: {
    bride: null,
    groom: null
  },
  allQuestsComplete() {
    return Object.values(this.quests).every(v => v === true);
  },
  reset() {
    Object.keys(this.quests).forEach(k => this.quests[k] = false);
    this.save();
  },
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: this.quests }));
    } catch (e) {}
  },
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.quests) {
        Object.keys(this.quests).forEach(k => {
          if (typeof data.quests[k] === 'boolean') this.quests[k] = data.quests[k];
        });
      }
    } catch (e) {}
  }
};

GameState.load();
