const secrets = require('./secrets.json');
const commands = require('./data/commands.json');

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

var reconnectCooldown = 0;

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('disconnect', () => {
  reconnectCooldown += 1000;

  console.log(`Disconnectd.  Reconnecting in ${reconnectCooldown / 1000} seconds...`);

  setTimeout(function() {
    client.login(secrets.DISCORD.BOT_TOKEN);
  }, reconnectCooldown);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isMessageComponent()) {
      let tmp = interaction.customId.split('_');
      interaction.commandName = tmp.shift();
      interaction.customId = tmp.join('_');

      if (interaction.commandName == 'play' && interaction.user.id != interaction.message.interaction.user.id) {
        return interaction.reply({
          content: "This isn't your game -- but you can /play your own!",
          ephemeral: true
        });
      } else {
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
      }
    } else if (interaction.isContextMenu()) {
      interaction.commandName = interaction.commandName.toLowerCase().replace(/\s/g, '');

      await interaction.deferReply({
        ephemeral: true
      });
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
  if (message.guild.id == "863864246835216464" && message.author.id == "121294882861088771" && message.content.startsWith('!')) {
    var command = message.content.split(' ').shift().replace('!', '');

    require(`./functions/${command}.js`)(message);
  }
});

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', async () => {
  console.log(`Birdy is online!`);
});

module.exports = client;
