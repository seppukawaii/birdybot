const Helpers = require('../helpers.js');

module.exports = function(interaction) {
  interaction.reply({
    content: `https://squawkoverflow.com/aviary/${interaction.targetId}`,
    ephemeral: true
  });
};