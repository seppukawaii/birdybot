const secrets = require('../secrets.json');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdybot'
});

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('ready', () => {
  client.guilds.fetch(secrets.EGGS[process.argv[2]]).then((guild) => {
    guild.emojis.fetch().then(async (emojis) => {
      emojis.each(async (emoji) => {
        console.log(emoji.id, emoji.name);

        await DB.save({
          key: DB.key(['Eggs', emoji.name]),
          data: {
            id: emoji.id
          }
        });
      });

      console.log('Done!');
      process.exit(0);
    });
  });
});
