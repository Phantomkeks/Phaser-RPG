// Global game state — quest completion + avatars
const GameState = {
  quests: {
    sockMonster: false,
    coffeeCups: false,
    weddingRing: false,
    cookTogether: false,
    planTrip: false
  },
  avatars: {
    bride: null, // texture key in Phaser cache
    groom: null
  },
  allQuestsComplete() {
    return Object.values(this.quests).every(v => v === true);
  },
  reset() {
    Object.keys(this.quests).forEach(k => this.quests[k] = false);
  }
};
