const secrets = require('./secrets.json');
const commands = require('./data/commands.json');

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ["CHANNEL"]
});

const discordModals = require('discord-modals');

discordModals(client);
client.login(secrets.DISCORD.BOT_TOKEN);

async function processInteraction(interaction) {
  try {
    if ((interaction.isMessageComponent && interaction.isMessageComponent()) || interaction.type == 'MODAL_SUBMIT') {
      let tmp = interaction.customId.split('-');

      interaction.noUpdate = interaction.type == 'MODAL_SUBMIT' || (tmp.length > 1 ? tmp.pop() == 'MODAL' : false);

      tmp = tmp[0].split('_');
      interaction.commandName = tmp.shift();
      interaction.customId = tmp.join('_');

      if (interaction.commandName == 'play' && interaction.message.interaction == null && interaction.message.reference?.messageId) {
        interaction.originalMessage = interaction.message;
        interaction.message = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
        interaction.noUpdate = true;
      }

      if (interaction.commandName == 'play' && interaction.user.id != interaction.message.interaction?.user.id) {
        return interaction.reply({
          content: "This isn't your game -- but you can /play your own!",
          ephemeral: true
        });
      } else {
        if (interaction.message?.components) {
          let components = interaction.message.components.map((actionRow) => {
            actionRow.components = actionRow.components.map((component) => {
              component.disabled = true;

              return component;
            });

            return actionRow;
          });

          if (!interaction.noUpdate) {
            await interaction.update({
              content: interaction.message.content || " ",
              components: components
            });
          }
        }
      }
    } else if (interaction.isContextMenu && interaction.isContextMenu()) {
      interaction.commandName = interaction.commandName.toLowerCase().replace(/\s/g, '');

      await interaction.deferReply({
        ephemeral: true
      });
    } else {
      var command = commands.find((command) => interaction.commandName == command.name);

      if (command && !command.doNotAck) {
        await interaction.deferReply({
          ephemeral: command.publicAck || !interaction.member ? false : true
        });
      }
    }

    require(`./functions/${interaction.commandName}.js`)(interaction);
  } catch (err) {
    console.error(err);
  }
}

client.on('interactionCreate', processInteraction);
client.on('modalSubmit', processInteraction);

client.on('messageCreate', (message) => {
  if (message.author.id != client.user.id) {
    if (message.guild?.id == "863864246835216464" && message.author.id == "121294882861088771" && message.content.startsWith('!')) {
      var command = message.content.split(' ').shift().replace('!', '');

      require(`./functions/${command}.js`)(message);
    } else if (message.mentions.repliedUser?.id == client.user.id) {
      message.channel.messages.fetch(message.reference.messageId).then((original) => {
        if (original.interaction.commandName == 'play' && original.interaction.user.id == message.author.id) {
          let interaction = original.interaction;

          interaction.type = 'REPLY';
          interaction.reply = message;
          interaction.message = original;
          interaction.client = client;

          require(`./functions/play.js`)(interaction);
        }
      });
    }
  }
});

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', async () => {
  console.log(`Birdy is online!`);

  client.user.setActivity('SQUAWKoverflow', {
    type: 'PLAYING',
    url: 'https://squawkoverflow.com'
  });
});

module.exports = client;