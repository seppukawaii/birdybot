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
  const memberId = interaction.options.getUser('user').id;
  var url = 'https://squawkoverflow.com';

  switch (interaction.options?.getSubcommand()) {
    case "aviary":
      url += `/aviary/${memberId}`;
      break;
    case "wishlist":
      url += `/wishlist/${memberId}`;
      break;
    case "gift":
      url = `<https://squawkoverflow.com/members/${memberId}/gift>`;
      break;
  }

  interaction.editReply({
    content: url,
    ephemeral: true
  });
}
