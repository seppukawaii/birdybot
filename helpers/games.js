const StormDB = require('stormdb');

function Games() {
  this.DB = new StormDB(new StormDB.localFileEngine(__dirname + "/../db/games.stormdb"));

  this.DB.default({
    games: {}
  });
}

Games.prototype.process = function(interaction) {
  return new Promise((resolve, reject) => {
    if (interaction.message) {
      let game = require(`../games/${interaction.customId.split('-').shift()}.js`);
      let currentState = this.DB.get(interaction.message.id).value();

      game.process(interaction, currentState).then((gameState) => {
        this.DB.set(interaction.message.id, gameState);

        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = new Games();
