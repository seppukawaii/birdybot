const API = require('../helpers/api.js');
const Chance = require('chance').Chance();

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const tileStyles = {
  hidden: 2,
  revealed: 2,
  oops: 4
};

const numMoji = [
  '🟦',
  '1️⃣',
  '2️⃣',
  '3️⃣',
  '4️⃣',
  '5️⃣',
  '6️⃣',
  '7️⃣',
  '8️⃣',
  '9️⃣'
];

const birdMoji = [
  "🦜", "🦃", "🐓", "🦢", "🐦", "🦆", "🐧", "🦉", "🦩", "🦚"
];

module.exports = {
  name: 'Birdsweeper',
  process: function(interaction, currentState) {
    return new Promise((resolve, reject) => {
      if (currentState) {
        resolve(this.play(interaction, currentState));
      } else {
        resolve(this.setup(interaction));
      }
    }).then((gameState) => {
      return this.print(interaction, gameState).then(() => {
        return gameState;
      });
    });
  },
  setup: function(interaction) {
    return new Promise((resolve, reject) => {
      var board = Array(22).fill({
        touches: 0,
        state: 'hidden',
        bird: false
      });

      Chance.pickset(birdMoji, 3).forEach((bird) => {
        board.push({
          emoji: bird,
          state: 'hidden',
          bird: true
        });
      });

      board = Chance.shuffle(board);

      for (var i = 0, len = board.length; i < len; i++) {
        let tile = {
          ...board[i]
        };

        if (!tile.bird) {
          let dirs = {
            north: i > 4,
            south: i < 20,
            east: (i + 1) % 5 != 0,
            west: i % 5 != 0
          };

          tile.touches += dirs.north && board[i - 5].bird ? 1 : 0;
          tile.touches += dirs.north && dirs.east && board[i - 4].bird ? 1 : 0;
          tile.touches += dirs.north && dirs.west && board[i - 6].bird ? 1 : 0;
          tile.touches += dirs.east && board[i + 1].bird ? 1 : 0;
          tile.touches += dirs.west && board[i - 1].bird ? 1 : 0;
          tile.touches += dirs.south && board[i + 5].bird ? 1 : 0;
          tile.touches += dirs.south && dirs.east && board[i + 6].bird ? 1 : 0;
          tile.touches += dirs.south && dirs.west && board[i + 4].bird ? 1 : 0;

          tile.emoji = numMoji[tile.touches];

          board[i] = tile;
        }
      }

      resolve({
        message: "Look out, there are birds on the loose! Do your best to surround them without spooking them so you can catch them safely.",
        board: board
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise(async (resolve, reject) => {
      var clicked = currentState.board[interaction.customId.split('_').pop()];

      if (clicked.state == "hidden") {
        if (clicked.bird) {
          if (currentState.board.filter((tile) => tile.state == 'revealed').length == 0) {
            currentState = await this.setup(interaction);

            return resolve(this.play(interaction, currentState));
          } else {
            currentState.message = "Oh no!  You spooked the bird away!  Better luck next time...";
            clicked.state = 'oops';
          }
        } else {
          clicked.state = 'revealed';

          if (clicked.touches == 0) {
            await this.revealAdjacentTiles(currentState, interaction.customId.split('_').pop() * 1);
          }

          if (currentState.board.filter((tile) => !tile.bird && tile.state == 'hidden').length == 0) {
            currentState.message = "Hurray!  You safely captured all the escaped birds!";
          }
        }
      }

      return resolve(currentState);
    });
  },
  revealAdjacentTiles: function(currentState, i, skip = []) {
    return new Promise((resolve, reject) => {
      let tile = currentState.board[i];
      let promises = [];

      skip = skip.length > 0 ? skip : [i];

      let dirs = {
        north: i > 4,
        south: i < 20,
        east: (i + 1) % 5 != 0,
        west: i % 5 != 0
      };

      if (dirs.north) {
        promises.push(this.revealTile(currentState, i - 5, skip));
        skip.push(i - 5);

        if (dirs.east) {
          promises.push(this.revealTile(currentState, i - 4, skip));
          skip.push(i - 4);
        }

        if (dirs.west) {
          promises.push(this.revealTile(currentState, i - 6, skip));
          skip.push(i - 6);
        }
      }

      if (dirs.south) {
        promises.push(this.revealTile(currentState, i + 5, skip));
        skip.push(i + 5);

        if (dirs.east) {
          promises.push(this.revealTile(currentState, i + 6, skip));
          skip.push(i + 6);
        }

        if (dirs.west) {
          promises.push(this.revealTile(currentState, i + 4, skip));
          skip.push(i + 4);
        }
      }

      if (dirs.east) {
        promises.push(this.revealTile(currentState, i + 1, skip));
        skip.push(i + 1);
      }

      if (dirs.west) {
        promises.push(this.revealTile(currentState, i - 1, skip));
        skip.push(i - 1);
      }

      Promise.all(promises).then(resolve);
    });
  },

  revealTile: function(currentState, i, skip) {
    return new Promise(async (resolve, reject) => {
      if (currentState.board[i]) {
        if (currentState.board[i].state == 'hidden') {
          currentState.board[i].state = 'revealed';

          if (currentState.board[i].touches == 0 && !skip.includes(i)) {
            await this.revealAdjacentTiles(currentState, i);
          }
        }
      }

      resolve();
    });
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var content = '<:birdsweeper:957739334759481344>   **Birdsweeper**\r\n\r\n';
      var components = [];
      gameState.over = gameState.board.find((tile) => tile.state == "oops") || gameState.board.filter((tile) => !tile.bird && tile.state == 'hidden').length == 0;

      for (var i = 0, len = gameState.board.length; i < len; i++) {
        if (i % 5 == 0) {
          components.push(new MessageActionRow());
        }

        let actionRow = components[components.length - 1];
        let tile = gameState.board[i];

        actionRow.addComponents(new MessageButton({
          type: 2,
          emoji: {
            name: !gameState.over && tile.state == "hidden" ? "⬛" : tile.emoji,
          },
          style: tileStyles[tile.state],
          customId: `play_birdsweeper_${i}`,
          disabled: gameState.over ? true : disabled
        }));
      }

      interaction.editReply({
        content: content + gameState.message,
        components: components
      }).then(() => {
        resolve();
      });
    }).catch((err) => {
      console.error(err);
      resolve();
    });
  }
};