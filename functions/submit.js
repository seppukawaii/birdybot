const API = require('../helpers/api.js');
const secrets = require('../secrets.json');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdybot'
});

module.exports = async function(interaction) {
  let url = interaction.options.getString('url');
  let adjectives = interaction.options.getString('adjectives');

  if (adjectives) {
    adjectives = adjectives.split(',');

    let preview = {};

    for (let adjective of adjectives) {
      adjective = adjective.toLowerCase().replace(/[^a-z]+/g, '');

      await interaction.client.guilds.fetch(secrets.EGGS[adjective.slice(0, 1).toUpperCase()]).then(async (guild) => {
        let existing = await guild.emojis.fetch().then((emojis) => emojis.find((emoji) => emoji.name == adjective));

        if (existing) {
          await existing.delete();
        }

        let id = await guild.emojis.create(url, adjective).then((emoji) => emoji.id);

        preview = {
          name: adjective,
          id: id
        };

        await DB.save({
          key: DB.key(['Eggs', adjective]),
          data: {
            id: id
          }
        });

        await API.call('_egg', 'POST', {
          adjective: adjective,
          id: id,
          member: interaction.user.id
        });
      });
    }

    interaction.editReply({
      content: `<:${preview.name}:${preview.id}>`,
      embeds: [{
        description: adjectives.join(', '),
        image: {
          url: `https://cdn.discordapp.com/emojis/${preview.id}.png`
        }
      }]
    });
  } else if (url) {
    interaction.editReply({
      content: `Please include a comma-separated list of adjectives for ${url}`
    });
  } else {
    interaction.editReply({
      content: 'Please include a URL (you can upload the image here, right-click it, and select Copy Link) and a comma-separated list of adjectives.'
    });
  }
}