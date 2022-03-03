const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

module.exports = async function(interaction, client) {
  console.log(interaction.type);
  if (interaction.type == 'MODAL_SUBMIT') {
    await interaction.deferReply({
      ephemeral: true
    })

    client.guilds.fetch('863864246835216464').then((guild) => {
      guild.members.fetch('121294882861088771').then((seppukawaii) => {
        seppukawaii.send({
          content: ' ',
          embeds: [{
            title: 'New Suggestion!',
            description: interaction.getTextInputValue('suggestion'),
            footer: {
              text: `from @${interaction.user.id}`
            }
          }]
        }).then(() => {
          interaction.followUp({
            content: 'Thanks for your suggestion!',
            ephemeral: true
          })
        });
      });
    });
  } else {
    const modal = new Modal()
      .setCustomId('suggest')
      .setTitle('Suggestion Box')
      .addComponents(
        new TextInputComponent()
        .setCustomId('suggestion')
        .setStyle('LONG')
        .setLabel('What is your suggestion?')
        .setRequired(true)
      );

    showModal(modal, {
      client: client,
      interaction: interaction
    });
  }
};
