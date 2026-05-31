# Marriage Quest

A short, retro-styled wedding RPG built with [Phaser 3](https://phaser.io/). The bride and groom set off on a series of mini-quests around their everyday life — from defeating the dreaded Sock Monster to planning the honeymoon trip — and finally reunite for the big day.

## Gameplay

After picking avatars for the bride and groom on the title/avatar screens, you explore an overworld and complete five mini-quests:

- **Sock Monster** — tame the laundry beast.
- **Coffee Cups** — clear the morning's evidence.
- **Wedding Ring** — find what was lost.
- **Cook Together** — prepare a meal as a team.
- **Plan Trip** — plot the honeymoon.

Once all five are done, the **Finale** scene plays the wedding.

## Project structure

```
index.html              Entry page; loads Phaser from CDN and the scripts below
js/
  main.js               Phaser.Game config and scene list
  data/
    gameState.js        Global quest + avatar state
    messages.js         In-game text
  scenes/
    TitleScene.js       Title screen
    AvatarScene.js      Avatar selection
    OverworldScene.js   Hub world
    QuestSockMonster.js
    QuestCoffeeCups.js
    QuestWeddingRing.js
    QuestCookTogether.js
    QuestPlanTrip.js
    FinaleScene.js      Wedding finale
```

The scenes are listed in `js/main.js` and registered globally via `<script>` tags in `index.html` (no bundler).

## Running locally

The game is plain HTML + JS. Because it loads scripts via relative paths, serve it over a local web server rather than opening `index.html` directly (browsers block some assets on `file://`).

Any static server works, for example:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then open <http://localhost:8000>.

> Note: `package.json` lists `phaser` as a dependency, but `index.html` currently loads Phaser **3.90.0** from a CDN — no `npm install` is required to run the game.

## Tech

- [Phaser 3](https://phaser.io/) (loaded from jsDelivr CDN)
- Vanilla JavaScript, no build step
- "Press Start 2P" font via Google Fonts for the retro look

## License

MIT — see [LICENSE](./LICENSE).
