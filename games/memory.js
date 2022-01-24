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
  matched: 3,
  active: 1,
  wrong: 4
};
const birdMoji = [
  "🦜", "🦃", "🐓", "🦢", "🐦", "🦆", "🐧", "🦉", "🦩", "🦚"
];

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
      var board = [];
      var birds = Chance.pickset(birdMoji, 6).forEach((bird) => {
        board.push({
          emoji: bird,
          state: 'hidden'
        }, {
          emoji: bird,
          state: 'hidden'
        });
      });

      board = Chance.shuffle(board);

      resolve({
        board: board
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise((resolve, reject) => {
      var clicked = currentState.board[interaction.customId.split('-').pop()];

      if (clicked.state == "hidden") {
        var selected = currentState.board.find((tile) => tile.state == "active");

        if (!selected) {
          clicked.state = "active";
          return resolve(currentState);
        } else {
          if (clicked.emoji == selected.emoji) {
            clicked.state = "matched";
            selected.state = "matched";

            return resolve(currentState);
          } else {
            clicked.state = "wrong";
            selected.state = "wrong";

            this.print(interaction, currentState, true).then(() => {
              setTimeout(function() {
                clicked.state = "hidden";
                selected.state = "hidden";
                resolve(currentState);
              }, 2000);
            });
          }
        }
      } else {
        return resolve(currentState);
      }
    });
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var components = [];
      gameState.over = gameState.board.filter((tile) => tile.state == "hidden").length == 0;

      for (var i = 0, len = gameState.board.length; i < len; i++) {
        if (i % 3 == 0) {
          components.push(new MessageActionRow());
        }

        let actionRow = components[components.length - 1];
        let tile = gameState.board[i];

        actionRow.addComponents(new MessageButton({
          type: 2,
          emoji: {
            name: tile.state == "hidden" ? "🟦" : tile.emoji,
          },
          style: tileStyles[tile.state],
          customId: `play_memory-${i}`,
          disabled: gameState.over ? true : disabled
        }));
      }

      interaction.editReply({
        content: gameState.over ? "You found all the birdies!" : "Birdy, birdy, where's the birdy?  Find the birdy and its mate!",
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
