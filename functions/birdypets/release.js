const API = require('../../helpers/api.js');

module.exports = async function(interaction) {
  const variant = interaction.message.embeds[0].image?.url.split('/').pop().split('.').shift();

  interaction.editReply({
    content: `:wave: You release the ${interaction.message.embeds[0].title} so it can find a home in another aviary!`,
    embeds: [],
    components: [{
	    type: 1,
	    components: [{
            type: 2,
            label: "Hatch Another Egg",
            style: 1,
            custom_id: 'hatch',
            emoji: {
              name: "🥚"
            }
          }]
    }]
  });

  API.call('release', 'POST', {
    loggedInUser: {
      auth: 'discord',
      token: interaction.user.id
    },
    variant: variant
  });
}
