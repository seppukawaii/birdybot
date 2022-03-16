const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

module.exports = async function(interaction) {
  switch (interaction.type) {
    case 'APPLICATION_COMMAND':
      var components = [{
        type: 1,
        components: [{
          type: 2,
          label: 'Do A Thing',
          style: 1,
          custom_id: `test-MODAL`
        }]
      }];

      interaction.reply({
        ephemeral: true,
        components: components
      }).then(() => {
        interaction.followUp({
          components: components
        });
      });
      break;
    case 'MESSAGE_COMPONENT':
      const modal = new Modal()
        .setCustomId('test')
        .setTitle('Testing')
        .addComponents(
          new TextInputComponent()
          .setCustomId('foo')
          .setStyle('SHORT')
          .setLabel('Test')
          .setRequired(true)
        );

      showModal(modal, {
        client: interaction.client,
        interaction: interaction
      });
      break;
    case 'MODAL_SUBMIT':
      interaction.reply({
        content: 'You did a thing!'
      });
      break;
  }
};
