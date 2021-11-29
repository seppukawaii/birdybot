const API = require('../helpers/api.js');

const secrets = require('../secrets.json');
const helpers = require('../helpers.js');

const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const webhookClient = new WebhookClient({
  id: secrets.DISCORD.WEBHOOK['free-birds'].ID,
  token: secrets.DISCORD.WEBHOOK['free-birds'].TOKEN
});

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', () => {
  client.guilds.fetch("863864246835216464").then((guild) => {
    guild.channels.fetch("890900328428503050").then((channel) => {
      clearMessages(channel).then(() => {
        API.call('freebirds', 'GET', {
          limit: 5
        }).then(async (response) => {
          let freebirds = response.results;

          for (var i = 0, len = freebirds.length; i < len; i++) {
            await new Promise((resolve, reject) => {
              let birdypet = freebirds[i];

              webhookClient.send({
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
              }).then(() => {
                resolve();
              });
            });
          }

          process.exit(0);
        });
      });
    });
  });
});

function clearMessages(channel) {
  return new Promise((resolve, reject) => {
    channel.bulkDelete(100)
      .then((messages) => {
        if (messages.size == 100) {
          resolve(clearMessages(channel));
        } else {
          resolve();
        }
      });
  });
}
