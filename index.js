const Members = require('/var/www/squawkoverflow/helpers/members.js');

const secrets = require('./secrets.json');
const commands = require('./data/commands.json');

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isMessageComponent()) {
      let tmp = interaction.customId.split('_');
      interaction.commandName = tmp.shift();
      interaction.customId = tmp.join('_');

      let components = interaction.message.components.map((actionRow) => {
        actionRow.components = actionRow.components.map((component) => {
          component.disabled = true;

          return component;
        });

        return actionRow;
      });

      await interaction.update({
        content: interaction.message.content,
        components: components
      });
    } else if (interaction.isContextMenu()) {
      interaction.commandName = interaction.commandName.toLowerCase().replace(/\s/g, '');
    } else {
      let commandNames = ["submit", "remove", "shuffle"];

      for (let commandName of commandNames) {
        if (interaction.commandName.endsWith(commandName)) {
          interaction.commandName = commandName;
        }
      }

      var command = commands.find((command) => interaction.commandName == command.name);

      if (command) {
        await interaction.deferReply({
          ephemeral: command.publicAck ? false : true
        });
      }
    }

    require(`./functions/${interaction.commandName}.js`)(interaction);
  } catch (err) {
    console.error(err);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.id == "121294882861088771" && message.content.startsWith('!')) {
    var command = message.content.split(' ').shift().replace('!', '');

    require(`./functions/${command}.js`)(message);
  }
});

client.on('guildMemberUpdate', (oldData, newData) => {
  if (oldData.displayName != newData.displayName || oldData.avatar != newData.avatar) {
    Members.set(newData.id, {
      'username': newData.displayName,
      'avatar': `https://cdn.discordapp.com/avatars/${newData.id}/${newData.avatar}.webp`
    });
  }
});

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', async () => {
  console.log(`Birdy is online!`);
});

module.exports = client;