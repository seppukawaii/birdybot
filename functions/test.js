const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

module.exports = async function(interaction) {
  if (interaction.type == 'APPLICATION_COMMAND') {
    interaction.reply({
      content: `testy mctesterson`,
      components: [{
        type: 1,
        components: [{
          type: 2,
          label: 'Do A Thing',
          style: 1,
          custom_id: `test-MODAL`
        }]
      }]
    });
  }
};
