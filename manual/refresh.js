const secrets = require('../secrets.json');
const commands = require('../data/commands.json');

const {
  REST
} = require('@discordjs/rest');

const {
  Routes
} = require('discord-api-types/v9');

const rest = new REST({
  version: '9'
}).setToken(secrets.DISCORD.BOT_TOKEN);

try {
  console.log('Started refreshing application commands.');

	console.log(commands);

  rest.put(
    Routes.applicationCommands(secrets.DISCORD.APPLICATION_ID), {
      body: commands
    },
  );

  console.log('Successfully reloaded application commands.');
} catch (error) {
  console.error(error);
}
