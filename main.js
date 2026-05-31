const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  pixelArt: true,
  backgroundColor: "#1a1a2e",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
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
