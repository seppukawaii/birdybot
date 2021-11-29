const API = require('../helpers/api.js');

const BirdyPets = require('/var/www/squawkoverflow/helpers/birdypets.js');
const Members = require('/var/www/squawkoverflow/helpers/members.js');
const Queue = require('/var/www/squawkoverflow/helpers/queue.js');
const Redis = require('/var/www/squawkoverflow/helpers/redis.js');

const secrets = require('../secrets.json');
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
  const action = interaction.customId.split('-').shift();

  switch (action) {
    case "keep":
      var eggy = interaction.message.content.match(/the (.*) egg/gm)[0];
      var birdypet = BirdyPets.fetch(interaction.customId.split('-').pop());

      API.call('collect', "POST", {
        loggedInUser: interaction.user.id,
        birdypet: birdypet.id,
        adjective: eggy.split(' ')[1]
      }).then(async (key) => {

        interaction.editReply({
          content: ":heart:",
          embeds: [],
          components: []
        }).then(() => {
          if (interaction.member) {
            interaction.channel.send({
              content: " ",
              embeds: [{
                title: birdypet.species.commonName,
                description: `<@${memberId}> hatched ${eggy}!`,
                image: {
                  url: `https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`
                },
                url: key ? `https://squawkoverflow.com/birdypet/${key}` : ""
              }]
            });
          } else {
            interaction.followUp({
              content: " ",
              embeds: [{
                title: birdypet.species.commonName,
                description: `You hatched ${eggy}!`,
                image: {
                  url: `https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`
                },
                url: key ? `https://squawkoverflow.com/birdypet/${key}` : ""
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
        birdypet: interaction.customId.split('-').pop()
      });

      break;
    case "catch":
      var birdypet = BirdyPets.fetch(interaction.customId.split('-').pop());
      var ackId = interaction.message.embeds[0].footer.iconURL.split('?').pop();

      var member = await Members.get(memberId);

      API.call('collect', "POST", {
        loggedInUser: interaction.user.id,
        birdypet: birdypet.id,
        freebird: ackId
      }).then(async (response) => {
        var embeds = [
          new MessageEmbed()
          .setTitle(birdypet.species.commonName)
          .setDescription(`${birdypet.version || ""} ${birdypet.label || ""}`)
          .setURL(`https://squawkoverflow.com/birdypet/${response}`)
          .setThumbnail(`https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`)
        ];

        interaction.message.delete();

        var pronoun = await Helpers.pronouns(member, 'determiner');

        interaction.channel.send({
          content: `${interaction.member.displayName} excitedly adds the ${birdypet.species.commonName} to ${pronoun} aviary!`,
          embeds: embeds
        }).then((message) => {
          message.edit({
            content: `<@${memberId}> excitedly adds the ${birdypet.species.commonName} to ${pronoun} aviary!`,
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
                    icon_url: `https://example.com/?${birdypet.ackId}`
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
