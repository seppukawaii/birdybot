const secrets = require('../secrets.json');
const commands = require('../data/commands.json');
const axios = require('axios');

const {
  REST
} = require('@discordjs/rest');

const {
  Routes
} = require('discord-api-types/v9');

const rest = new REST({
  version: '9'
}).setToken(secrets.DISCORD.BOT_TOKEN);

const headers = {
  headers: {
    "Authorization": `Bearer ${process.argv[2]}`
  }
};

try {
  console.log('Started refreshing application commands.');

  rest.put(
    Routes.applicationCommands(secrets.DISCORD.APPLICATION_ID), {
      body: commands.filter((command) => command.global)
    },
  );

  console.log('Successfully reloaded application commands.');

  console.log('Started refreshing server commands.');

  rest.put(
    Routes.applicationGuildCommands(secrets.DISCORD.APPLICATION_ID, secrets.DISCORD.GUILD_ID), {
      body: commands.filter((command) => !command.global)
    }
  ).then(async (response) => {
    for (let command of response) {
      let cmd = commands.find((cmd) => cmd.name == command.name);

      if (cmd.permissions) {
        var res = await axios.put(`https://discord.com/api/v9/applications/${secrets.DISCORD.APPLICATION_ID}/guilds/${secrets.DISCORD.GUILD_ID}/commands/${command.id}/permissions`, {
          permissions: cmd.permissions
        }, headers);
      }
    }
  });

  console.log('Successfully reloaded server commands.');
} catch (error) {
  console.error(error.toJSON());
}
