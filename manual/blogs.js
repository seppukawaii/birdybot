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
    guild.channels.fetch("952569469983674368").then((channel) => {
      clearMessages(channel).then(() => {
        channel.send({
          content: "Have a blog you'd like to be included in the Flock of Niche Bird Blogs?\r\n\r\n*Disclaimer: By adding your bird blog to the Flock, this allows vetted, trusted, and authorized members of the server to submit photos to that blog's queue. Members do NOT have access to the blog directly and all photo submissions are logged so any abuse can be tracked and dealt with.*",
          components: [{
            type: 1,
            components: [{
              type: 2,
              style: 1,
              label: 'Submit Blog',
              customId: 'birdyblogs_submit-MODAL'
            }]
          }]
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
