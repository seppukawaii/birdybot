const Helpers = require('../helpers.js');

module.exports = function(interaction) {
  interaction.editReply({
    content: `https://squawkoverflow.com/wishlist/${interaction.targetId}`,
    ephemeral: true
  });
};
