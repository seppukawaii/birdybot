const Secrets = require('../secrets.json');

module.exports = async function(interaction) {
  var embed = {
    footer: {
      text: interaction.user.id
    }
  };

  switch (interaction.options?.getSubcommand()) {
    case 'bordle-add':
      embed.title = 'Bordle - ADD';
      embed.description = interaction.options.getString('word');
      break;
    case 'bordle-remove':
      embed.title = 'Bordle - REMOVE';
      embed.description = interaction.options.getString('word');
      break;
    case 'egg-add':
      embed.title = 'Eggs - ADD';
      embed.description = interaction.options.getString('bird') + "\r\n" + interaction.options.getString('egg');
      break;
    case 'egg-remove':
      embed.title = 'Eggs - REMOVE';
      embed.description = interaction.options.getString('bird') + "\r\n" + interaction.options.getString('egg');
      break;
    default:
      embed.title = 'Other';
      embed.description = interaction.options.getString('suggestion');
  }

  interaction.guild.members.fetch('121294882861088771').then((auntie) => {
    auntie.send({
      content: ' ',
      embeds: [embed]
    }).then(() => {
      interaction.editReply({
        content: 'Your suggestion has been sent to seppukawaii!'
      });
    });
  });
};
