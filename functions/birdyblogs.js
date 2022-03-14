const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

module.exports = async function(interaction) {
  if (interaction.type == 'MESSAGE_COMPONENT') {
    const modal = new Modal()
      .setCustomId(`birdyblogs_${Date.now()}`)
      .setTitle('Join the Flock of Niche Bird Blogs')
      .addComponents(
        new TextInputComponent()
        .setCustomId('blog')
        .setStyle('SHORT')
        .setLabel('Link to your niche bird blog:')
        .setRequired(true)
      );

    showModal(modal, {
      client: interaction.client,
      interaction: interaction
    });
  } else if (interaction.type == 'MODAL_SUBMIT') {
    await interaction.deferReply({
      ephemeral: true
    })

    interaction.client.guilds.fetch('863864246835216464').then((guild) => {
      guild.channels.fetch('951902416335413268').then((channel) => {
        channel.send({
          content: `A blog has been submitted to be included in the flock by <@${interaction.user.id}>.\r\n\r\n${interaction.getTextInputValue('blog')}`,
        }).then((message) => {
          interaction.followUp({
            content: 'Thanks for your submission! You will receive a message from seppukawaii soon.',
            ephemeral: true
          });
        });
      });
    });
  }
};
