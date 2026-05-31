const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  pixelArt: true,
  backgroundColor: "#1a1a2e",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [
    TitleScene,
    IntroScene,
    AvatarScene,
    OverworldScene,
    QuestSockMonster,
    QuestCoffeeCups,
    QuestWeddingRing,
    QuestCookTogether,
    QuestPlanTrip,
    QuestVows,
    QuestDance,
    QuestPhotoAlbum,
    QuestGarden,
    QuestCake,
    FinaleScene,
  ],
};

const game = new Phaser.Game(config);
