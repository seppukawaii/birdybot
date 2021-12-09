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
  const illustration = interaction.message.embeds[0].image?.url.split('/').pop().split('.').shift();

  switch (action) {
    case "keep":
      var eggy = interaction.message.content.match(/the (.*) egg/gm)[0];

      API.call('collect', "POST", {
        loggedInUser: interaction.user.id,
        illustration: illustration,
        adjective: eggy.split(' ')[1]
      }).then(async (memberpet) => {

        interaction.editReply({
          content: ":heart:",
          embeds: [],
          components: []
        }).then(() => {
          if (interaction.member) {
            interaction.channel.send({
              content: " ",
              embeds: [{
                title: memberpet.species.commonName,
                description: `<@${memberId}> hatched ${eggy}!`,
                image: {
                  url: memberpet.image
                },
                url: memberpet.id ? `https://squawkoverflow.com/birdypet/${memberpet.id}` : ""
              }]
            });
          } else {
            interaction.followUp({
              content: " ",
              embeds: [{
                title: memberpet.species.commonName,
                description: `You hatched ${eggy}!`,
                image: {
                  url: memberpet.image
                },
                url: memberpet.id ? `https://squawkoverflow.com/birdypet/${memberpet.id}` : ""
              }]
            });
          }
        });
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
        illustration: illustration
      });

      break;
    case "catch":
      var freebirdId = interaction.message.embeds[0].footer.iconURL.split('?').pop();

      API.call('collect', "POST", {
        loggedInUser: interaction.user.id,
        illustration: illustration,
        freebird: freebirdId
      }).then(async (memberpet) => {
        var embeds = [
          new MessageEmbed()
          .setTitle(memberpet.species.commonName)
          .setDescription(`${memberpet.label || " "}`)
          .setURL(`https://squawkoverflow.com/birdypet/${memberpet.id}`)
          .setThumbnail(memberpet.image)
        ];

        interaction.message.delete();

        var member = await API.call('member', 'GET', {
          id: interaction.user.id
        });

        var pronoun = member && member.pronouns ? Helpers.pronouns(member, 'determiner') : 'their';

        interaction.channel.send({
          content: `${interaction.member.displayName} excitedly adds the ${memberpet.species.commonName} to ${pronoun} aviary!`,
          embeds: embeds
        }).then((message) => {
          message.edit({
            content: `<@${memberId}> excitedly adds the ${memberpet.species.commonName} to ${pronoun} aviary!`,
            embeds: embeds
          });

          setTimeout(function() {
            API.call('freebirds', 'GET', {
              limit: 1
            }).then(async (response) => {
              let birdypet = response.results[0];

              message.edit({
                content: require('../data/webhooks.json').release.sort(() => .5 - Math.random())[0],
                embeds: [{
                  title: birdypet.species.commonName,
                  url: `https://squawkoverflow.com/birdypedia/bird/${birdypet.species.speciesCode}`,
                  description: birdypet.label,
                  image: {
                    url: birdypet.image
                  },
                  footer: {
                    text: "⠀",
                    icon_url: `https://example.com/?${birdypet.freebirdId}`
                  }
                }],
                components: [{
                  type: 1,
                  components: [{
                    type: 2,
                    label: 'Add to Aviary!',
                    style: 1,
                    custom_id: `birdypets_catch-${birdypet.id}`,
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
