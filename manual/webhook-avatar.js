const secrets = require('../secrets.json');

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('ready', async () => {
  for (var id in secrets.WEBHOOK) {
    var webhook = secrets.WEBHOOK[id];

    await client.fetchWebhook(webhook.ID, webhook.TOKEN).then(async (webhook) => {
      await webhook.edit({
        avatar: client.user.avatarURL().replace('.webp', '.png')
      });
    });
  }

  process.exit(0);
});
