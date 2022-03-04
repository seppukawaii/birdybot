const API = require('../../helpers/api.js');

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const action = interaction.customId;
  const variant = interaction.message.embeds[0].image?.url.split('/').pop().split('.').shift();

  var eggy = interaction.message.content.match(/the (.*) egg/gm)[0];

  API.call('collect', "POST", {
    loggedInUser: {
      auth: 'discord',
      token: interaction.user.id
    },
    variant: variant,
    adjective: eggy.split(' ')[1]
  }).then(async (birdypet) => {
    interaction.editReply({
      content: `You hatched ${eggy}!`,
      embeds: [{
        title: birdypet.bird.commonName,
        description: (birdypet.variant.label + (birdypet.variant.label && birdypet.variant.subspecies ? ' - ' : '') + (birdypet.variant.subspecies ? `${birdypet.variant.subspecies} subspecies` : '')) + ' ',
        image: {
          url: birdypet.variant.image
        },
        url: `https://squawkoverflow.com/birdypet/${birdypet.id}`
      }],
      components: [{
        type: 1,
        components: [{
          type: 2,
          label: 'Nickname & Description',
          style: 1,
          custom_id: `birdypets_edit`,
          emoji: {
            name: "✏️"
          }
        }]
      }, {
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
  });
}
