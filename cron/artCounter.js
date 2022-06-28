const API = require('../helpers/api.js');
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
    guild.channels.fetch("885182652691402822").then((channel) => {
      API.call('birdypedia', 'GET', {}).then((allResults) => {
        API.call('birdypedia', 'GET', {
          artist: 'n/a'
        }).then((naResults) => {
          var percent = Math.floor((allResults.totalResults - naResults.totalResults) / allResults.totalResults * 100);

          let nextPercent = percent + 1;

          let toNextPercent = Math.ceil(allResults.totalResults * nextPercent / 100) - (allResults.totalResults - naResults.totalResults);

          channel.edit({
            topic: `${percent}% of birds have non-placeholder art!  Only ${toNextPercent} more to reach ${nextPercent}%!!`
          }).then(() => {

            process.exit(0);
          });
        });
      });
    });
  });
});
