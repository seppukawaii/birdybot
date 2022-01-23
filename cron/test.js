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
	let egg = process.argv[2];
	let letter = egg.slice(0, 1).toUpperCase();

	client.guilds.fetch(secrets.EGGS[letter]).then(async (guild) => {
		let icon = await guild.emojis.fetch().then((emojis) => emojis.find((emoji) => emoji.name == egg));

		if (icon) {
			resolve({ id : icon.id });
		}
		else {
			resolve({ name : '🥚' });
		}
	process.exit(0);
	});
});
