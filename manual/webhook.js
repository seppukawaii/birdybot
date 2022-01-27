const secrets = require('./secrets.json');

const {
  Client,
  Intents,
  WebhookClient
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('ready', () => {
  client.guilds.fetch("863864246835216464").then((guild) => {
    guild.channels.fetch(process.argv[2]).then((channel) => {
      channel.createWebhook('Birdy', {
        avatar: client.user.avatarURL().replace('.webp', '.png')
      }).then((webhook) => {
        console.log(webhook.id);
        console.log(webhook.token);
      });
    });
  });
});