const Helpers = require('../helpers.js');

module.exports = function(interaction) {
  interaction.reply({
    content: `<https://squawkoverflow.com/members/${interaction.targetId}/gift>`,
    ephemeral: true
  });
};