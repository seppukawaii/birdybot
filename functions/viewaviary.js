const API = require('../helpers/api.js');

module.exports = function(interaction) {
  API.call('member', "GET", {
    id: {
      auth: 'discord',
      token: interaction.targetId
    },
  }).then((member) => {
    interaction.editReply({
      content: `https://squawkoverflow.com/aviary/${member.id}`,
      ephemeral: true
    });
  });
};
