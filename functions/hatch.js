const API = require('../helpers/api.js');

const Chance = require('chance').Chance();
const Helpers = require('/var/www/squawkoverflow/helpers.js');
const Members = require('/var/www/squawkoverflow/helpers/members.js');
const Redis = require('/var/www/squawkoverflow/helpers/redis.js');

const secrets = require('../secrets.json');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require('discord.js');

module.exports = async function(interaction) {
  API.call('hatch', "GET", {
      loggedInUser: interaction.user.id,
    }).then((response) => {
      let eggs = response.slice(0, 5);

      interaction.editReply({
        content: "These eggs are almost ready to hatch!  Which one will you pick?",
        ephemeral: true,
        components: [{
          type: 1,
          components: eggs.map((egg) => {
            return {
              type: 2,
              label: `${egg.name} egg`,
              style: 2,
              custom_id: `eggytime_${egg.name}`,
              emoji: egg.icon ? {
                id: egg.icon
              } : {
                name: "🥚"
              }
            };
          })
        }]
      });
    })
    .catch((err) => {
      interaction.editReply({
        content: `*You have ${err.response.data.timeUntil} minutes before you can hatch another egg.*`,
        ephemeral: true
      });
    });
}
