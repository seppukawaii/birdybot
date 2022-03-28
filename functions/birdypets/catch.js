const API = require('../../helpers/api.js');

module.exports = async function(interaction) {
  if (interaction.customId == 'DM') {
    interaction.user.send({
      embeds: interaction.message.embeds,
      components: [{
        type: 1,
        components: [{
          type: 2,
          label: 'Nickname & Description',
          style: 1,
          custom_id: `birdypets/edit-MODAL`,
          emoji: {
            name: "✏️"
          }
        }]
      }]
    });
  } else {
    const variant = interaction.message.embeds[0].image?.url.split('/').pop().split('.').shift();
    let freebird = interaction.message.embeds[0].image?.url.split('#').pop();

    API.call('collect', "POST", {
      loggedInUser: {
        auth: 'discord',
        token: interaction.user.id
      },
      userData: interaction.member ? {
        username: interaction.member.displayName,
        avatar: interaction.member.displayAvatarURL(),
        serverMember: true
      } : {
        username: interaction.user.username,
        avatar: interaction.user.avatarURL(),
        serverMember: false
      },
      freebird: freebird,
      variant: variant
    }).then(async (birdypet) => {
      if (birdypet.error) {
        interaction.followUp({
          content: birdypet.error,
          ephemeral: true
        });
      } else {
        interaction.followUp({
          content: `You added the free bird to your aviary!`,
          ephemeral: true,
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
              label: 'Manage BirdyPet',
              style: 1,
              custom_id: `birdypets/catch_DM`,
            }]
          }]
        });
      }

      interaction.message.delete();

      API.call('freebirds', 'GET', {
        limit: 5
      }).then(async (response) => {
        var freebirds = response.results;

        await interaction.channel.messages.fetch({
          limit: 10
        }).then((messages) => {
          messages.each((msg) => {
            if (msg.components.length > 0 && msg.components[0].components[0].label == 'Add to Aviary!') {
              freebirds = freebirds.filter((freebird) => freebird.id != msg.embeds[0].image.url.split('#').pop());
            }
          });

          if (freebirds.length > 0) {
            interaction.channel.send({
              content: require('../../data/webhooks.json').release.sort(() => .5 - Math.random())[0],
              embeds: [{
                title: freebirds[0].bird.commonName,
                url: `https://squawkoverflow.com/birdypedia/bird/${freebirds[0].bird.id_slug}`,
                description: freebirds[0].label,
                image: {
                  url: freebirds[0].image + '#' + freebirds[0].freebird
                }
              }],
              components: [{
                type: 1,
                components: [{
                  type: 2,
                  label: 'Add to Aviary!',
                  style: 1,
                  custom_id: `birdypets_catch`,
                }]
              }]
            })
          }
        })
      });
    });
  }
}
