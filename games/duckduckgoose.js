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

        this.checkForVictory(currentState);

        if (!currentState.over) {
          await this.birdyPlay(currentState);

          this.checkForVictory(currentState);
        }
      }

      return resolve(currentState);
    });
  },
  checkForVictory: function(currentState) {
    for (let three of threes) {
      let states = currentState.board.filter((val, i) => three.includes(i));

      if (states.filter((val) => val == 'duck').length == 3 || states.filter((val) => val == 'goose').length == 3) {
        currentState.over = true;
        currentState.winner = currentState.board[three[0]];
        currentState.message = currentState.winner == 'duck' ? '<a:duckparty:864788796616343552> The duck wins!' : '<a:GooseDance:657000218092634113>  The goose wins!';

        break;
      }
    }

    return true;
  },
  birdyPlay: function(currentState) {
    var possiblePlays = [];

    for (let three of threes) {
      let states = currentState.board.filter((val, i) => three.includes(i));
      let ducks = states.filter((val) => val == 'duck').length;
      let geese = states.filter((val) => val == 'goose').length;

      for (let i of three) {
        if (currentState.board[i] == 'empty') {
          var score = possiblePlays[i] ? possiblePlays[i].score : 0;

          if (geese == 2) {
            score += 4;
          } else if (ducks == 1) {
            score -= 2;
          } else if (ducks == 2) {
            score += 3;
          }

          possiblePlays[i] = {
            index: i,
            score: score
          };
        }
      }
    }

    if (possiblePlays.length > 0) {
      possiblePlays = possiblePlays.filter((val) => val !== null && typeof val !== 'undefined').sort((a, b) => b.score - a.score);

      currentState.board[possiblePlays[0].index] = 'goose';
    }

    return true;
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var content = '<:duckduckgoose:957738031895433216>   **Duck Duck Goose**\r\n\r\n';
      var components = [];

      if (gameState.board.filter((val) => val == 'empty').length == 0) {
        gameState.over = true;
        gameState.message = "<a:duckanger:864790260176257035>   It's a tie!  <a:m_goose_honk:871817507151970356>"
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
