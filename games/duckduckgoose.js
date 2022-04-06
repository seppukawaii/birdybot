const API = require('../helpers/api.js');
const Chance = require('chance').Chance();

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const emoji = {
  empty: {
    name: '⬛'
  },
  duck: {
    name: '🦆'
  },
  goose: {
    id: '898367758964777020',
    name: 'goose'
  }
};

const threes = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2]
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
      var board = Array(9).fill('empty');

      resolve({
        message: "Try to get all your ducks in a row before the geese do!",
        board: board
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise(async (resolve, reject) => {
      var clicked = interaction.customId.split('_').pop();

      if (currentState.board[clicked] == 'empty') {
        currentState.board[clicked] = 'duck';

        var birdyMove = this.minimax(currentState.board);

        if (birdyMove.index >= 0) {
          currentState.board[birdyMove.index] = 'goose';
        }
      }

      return resolve(currentState);
    });
  },
  checkForVictory: function(board) {
    if (board.filter((val) => val == "empty").length == 0) {
      return "tie";
    }

    for (let three of threes) {
      let states = board.filter((val, i) => three.includes(i));

      if (states.filter((val) => val == 'duck').length == 3 || states.filter((val) => val == 'goose').length == 3) {
        return board[three[0]];
      }
    }

    return true;
  },
  minimax: function(board, isMax = false) {
    var winner = this.checkForVictory(board);

    if (winner == "duck") {
      return {
        index: -1,
        score: 1
      };
    } else if (winner == "goose") {
      return {
        index: -1,
        score: -1
      };
    } else if (winner == "tie") {
      return {
        index: -1,
        score: 0
      };
    } else {
      var best = {
        index: -1,
        score: isMax ? -Infinity : Infinity
      };

      for (let i = 0; i < 9; i++) {
        if (board[i] != "empty") {
          continue;
        }

        board[i] = isMax ? "duck" : "goose";
        var score = this.minimax(board, !isMax).score;
        board[i] = "empty";

        if (isMax && score > best.score) {
          best = {
            index: i,
            score: score
          };
        } else if (!isMax && score < best.score) {
          best = {
            index: i,
            score: score
          };
        }
      }

      return best;
    }
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var content = '<:duckduckgoose:957738031895433216>   **Duck Duck Goose**\r\n\r\n';
      var components = [];

      switch (this.checkForVictory(gameState.board)) {
        case "duck":
          gameState.over = true;
          gameState.message = '<a:duckparty:864788796616343552> The duck wins!';
          break;
        case "goose":
          gameState.over = true;
          gameState.message = '<a:GooseDance:657000218092634113>  The goose wins!';
          break;
        case "tie":
          gameState.over = true;
          gameState.message = "<a:duckanger:864790260176257035>  It's a tie!  <a:m_goose_honk:871817507151970356>"
          break;
      }

      for (var i = 0, len = gameState.board.length; i < len; i++) {
        if (i % 3 == 0) {
          components.push(new MessageActionRow());
        }

        let actionRow = components[components.length - 1];
        let tile = gameState.board[i];

        actionRow.addComponents(new MessageButton({
          type: 2,
          emoji: emoji[tile],
          style: 2,
          customId: `play_duckduckgoose_${i}`,
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
