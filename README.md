# Marriage Quest

A short, retro-styled wedding RPG built with [Phaser 3](https://phaser.io/). The bride and groom set off on ten mini-quests around their everyday life — defeating the dreaded Sock Monster, writing their vows, rescuing the wedding cake — and finally reunite for the big day.

## Gameplay

After picking avatars for the bride and groom on the title/avatar screens, you explore an overworld and complete ten mini-quests:

- **Sock Monster** — tame the laundry beast in a click-to-attack battle.
- **Coffee Cups** — collect ten cups before the timer runs out.
- **Wedding Ring** — warmer/colder hunt: click around until something feels burning hot.
- **Cook Together** — click ingredients in the recipe's order.
- **Plan Trip** — branching dialog choices that build a shared adventure.
- **Write Vows** — fill-in-the-blank vow that gets recited at the wedding.
- **Dance Together** — Simon-Says with arrow keys; three rounds of increasing tempo.
- **Photo Album** — memory match six pixel-art memories with personal captions.
- **Garden** — plant from a visible seed queue and line up three flowers of the same color.
- **Rescue the Cake** — dodge fly swatters and catch falling cake layers.

Progress saves automatically to `localStorage`, so refreshing the page won't reset the wedding. Press **ESC** during any quest to bail back to the overworld map.

Once all ten quests are done, a heart-shaped **Finale** node appears in the center of the map. Walking into it plays the wedding scene, recites the vow you wrote, and reveals messages from friends and family.

## Project structure

```
index.html              Entry page; loads Phaser from CDN and the scripts below
main.js                 Phaser.Game config and scene list
data/
    gameState.js        Quest progress, avatars, vow — persisted to localStorage
    messages.js         Friends' messages shown on the finale screen
    theme.js            Shared font, colors, and text styles
scenes/
    BaseScene.js        Common helpers (titles, buttons, ESC-to-overworld)
    TitleScene.js       Title screen
    AvatarScene.js      Avatar selection (uploads photos, pixelates them)
    OverworldScene.js   Hub world map with quest nodes
    FinaleScene.js      Wedding finale with vow + friends' messages
quests/
    QuestSockMonster.js
    QuestCoffeeCups.js
    QuestWeddingRing.js
    QuestCookTogether.js
    QuestPlanTrip.js
    QuestVows.js
    QuestDance.js
    QuestPhotoAlbum.js
    QuestGarden.js
    QuestCake.js
```

All quest scenes extend `BaseScene` for consistent styling and ESC handling. The scene list lives in `main.js` and scenes are registered globally via `<script>` tags in `index.html` (no bundler).

## Customizing for your wedding

A few spots to make this your own:

- **`data/messages.js`** — replace the placeholder friends with real names and messages; they appear on the finale screen.
- **`quests/QuestPhotoAlbum.js`** — the `memories` array holds six captions like *"That tiny beach where you first said it."* Swap in real ones.
- **`quests/QuestVows.js`** — the `blanks` array defines the fill-in-the-blank choices that build the vow.
- **`quests/QuestPlanTrip.js`** — the `steps` array defines the dialog branches.

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
