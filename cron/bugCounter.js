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
  const digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

  client.guilds.fetch("863864246835216464").then((guild) => {
    guild.channels.fetch("888535114236174367").then((channel) => {
      let counter = channel.topic.split('bug: ').pop().trim();

      for (let num in digits) {
        counter = counter.replace(new RegExp(`:${digits[num]}:`, 'g'), num);
      }

      counter = (counter * 1) + 1;

      for (let num in digits) {
        counter = `${counter}`.replace(new RegExp(num, 'g'), `:${digits[num]}:`);
      }

      console.log(counter);

      channel.edit({
        topic: `days since last bug:  ${counter}`
      }).then(() => {

        process.exit(0);
      });
    });
  });
});