const API = require('../helpers/api.js');

const Helpers = require('../helpers.js');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require('discord.js');

const {
  v1
} = require('@google-cloud/pubsub');

const subClient = new v1.SubscriberClient();

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const action = interaction.customId;
  const variant = interaction.message.embeds[0].image?.url.split('/').pop().split('.').shift();

  switch (action) {
    case "keep":
      var eggy = interaction.message.content.match(/the (.*) egg/gm)[0];

      API.call('collect', "POST", {
        loggedInUser: interaction.user.id,
        variant: variant,
        adjective: eggy.split(' ')[1]
      }).then(async (birdypet) => {
        if (interaction.member) {
          interaction.editReply({
            content: `:heart: <https://squawkoverflow.com/birdypet/${birdypet.id}>`,
            embeds: [],
            components: []
          });
        } else {
          interaction.followUp({
            content: " ",
            embeds: [{
              title: birdypet.bird.commonName,
              description: `You hatched ${eggy}!`,
              image: {
                url: birdypet.variant.image
              },
              url: birdypet.id ? `https://squawkoverflow.com/birdypet/${birdypet.id}` : ""
            }]
          });
        }
      });
      break;
    case "release":
      interaction.editReply({
        content: ":wave:",
        embeds: [],
        components: []
      });

      API.call('release', 'POST', {
        loggedInUser: memberId,
        variant: variant
      });

      break;
    case "catch":
      let freebird = interaction.message.embeds[0].image?.url.split('#').pop();

      API.call('collect', "POST", {
        loggedInUser: interaction.user.id,
        freebird: freebird
      }).then(async (birdypet) => {
        interaction.message.delete();

        var member = await API.call('member', 'GET', {
          id: interaction.user.id
        });

        var pronoun = member && member.pronouns ? Helpers.pronouns(member, 'determiner') : 'their';

        var embeds = [{
          title: birdypet.variant.bird.commonName,
          description: birdypet.variant.label || " ",
          image: {
            url: birdypet.variant.image
          },
          url: `https://squawkoverflow.com/birdypet/${birdypet.id}`
        }];

        interaction.channel.send({
          content: `${interaction.member.displayName} excitedly adds the ${birdypet.variant.bird.commonName} to ${pronoun} aviary!`,
          embeds: embeds
        }).then((message) => {
          message.edit({
            content: `<@${memberId}> excitedly adds the ${birdypet.variant.bird.commonName} to ${pronoun} aviary!`,
            embeds: embeds
          });

          setTimeout(function() {
            API.call('freebirds', 'GET', {
              limit: 1
            }).then(async (response) => {
              let result = response.results[0];

              message.edit({
                content: require('../data/webhooks.json').release.sort(() => .5 - Math.random())[0],
                embeds: [{
                  title: result.bird.commonName,
                  url: `https://squawkoverflow.com/birdypedia/bird/${result.bird.code}`,
                  description: result.label,
                  image: {
                    url: result.image + '#' + result.freebird
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
              });
            })
          }, 1000 * 60); // one minute
        });
      });
      break;
  }
}
