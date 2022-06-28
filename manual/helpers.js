const secrets = require('../secrets.json');

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('ready', () => {
  client.guilds.fetch("863864246835216464").then((guild) => {
    guild.channels.fetch("968978984907972658").then((channel) => {
        channel.send({
          content: " ",
          components: [{
            type: 1,
            components: [{
              type: 2,
              style: 1,
              label: 'Toggle Helper Birdy Role',
              customId: 'helper-MODAL'
            }]
          }]
      });
    });
  });
});
