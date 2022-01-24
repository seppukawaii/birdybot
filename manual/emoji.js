const API = require('../helpers/api.js');
const secrets = require('../secrets.json');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  projectId: 'bot-central',
  namespace: 'birdybot'
});

const {
  Storage
} = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'squawkoverflow'
});

const bucket = storage.bucket('squawkoverflow');

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

        let file = bucket.file(`eggs/${emoji.name.slice(0, 1).toUpperCase()}/${emoji.name}.png`);

        await Jimp.read(`https://cdn.discordapp.com/emojis/${emoji.id}.png`).then(async (image) => {
		console.log(image);

          await image
            .getBuffer(Jimp[`MIME_PNG`], async (err, buff) => {
              await file.save(buff);
            });
        });
      });

      console.log('Done!');
      process.exit(0);
    });
  });
});
