const API = require('../helpers/api.js');
const Chance = require('chance').Chance();

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const tileStyles = {
  open: 2,
  victory: 3
};

module.exports = {
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
        state: 'open',
        
      });

      resolve({
        message: "Duck duck goose!",
        board: board
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise(async (resolve, reject) => {
      var clicked = currentState.board[interaction.customId.split('-').pop()];

      if (clicked.state == "hidden") {
        if (clicked.bird) {
          if (currentState.board.filter((tile) => tile.state == 'revealed').length == 0) {
            currentSate = await this.setup(interaction);

            this.play(interaction, currentState);
          } else {
            currentState.message = "Oh no!  You spooked the bird away!  Better luck next time...";
            clicked.state = 'oops';
          }
        } else {
          clicked.state = 'revealed';

          if (clicked.touches == 0) {
            this.revealAdjacentTiles(currentState, interaction.customId.split('-').pop() * 1);
          }

          if (currentState.board.filter((tile) => !tile.bird && tile.state == 'hidden').length == 0) {
            currentState.message = "Hurray!  You safely captured all the escaped birds!";
          }
        }
      }

      return resolve(currentState);
    });
  },
  revealAdjacentTiles: function(currentState, i) {
    let tile = currentState.board[i];

    let dirs = {
      north: i > 4,
      south: i < 20,
      east: (i + 1) % 5 != 0,
      west: i % 5 != 0
    };

    if (dirs.north) {
      this.revealTile(currentState, i - 5);

      if (dirs.east) {
        this.revealTile(currentState, i - 4);
      }

      if (dirs.west) {
        this.revealTile(currentState, i - 6);
      }
    }

    if (dirs.south) {
      this.revealTile(currentState, i + 5);

      if (dirs.east) {
        this.revealTile(currentState, i + 6);
      }

      if (dirs.west) {
        this.revealTile(currentState, i + 4);
      }
    }

    if (dirs.east) {
      this.revealTile(currentState, i + 1);
    }

    if (dirs.west) {
      this.revealTile(currentState, i - 1);
    }
  },

  revealTile: function(currentState, i) {
    if (currentState.board[i]) {
      if (currentState.board[i].state == 'hidden') {
        currentState.board[i].state = 'revealed';

        if (currentState.board[i].touches == 0) {
          this.revealAdjacentTiles(currentState, i);
        }
      }
    } else {
      console.log('cannot reveal', i);
    }
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
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
          customId: `play_birdsweeper-${i}`,
          disabled: gameState.over ? true : disabled
        }));
      }

      interaction.editReply({
        content: gameState.message,
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
