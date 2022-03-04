const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

const API = require('../../helpers/api.js');
const axios = require('axios');

module.exports = async function(interaction) {
  var birdypet = interaction.message.embeds[0].url.split('/').pop();

  if (interaction.type == 'MESSAGE_COMPONENT') {
    API.call('birdypet', 'GET', {
      id: birdypet
    }).then((birdypet) => {
      const modal = new Modal()
        .setCustomId(`birdypets_edit_${Date.now()}`)
        .setTitle('Edit BirdyPet')
        .addComponents(
          new TextInputComponent()
          .setCustomId('birdypet_nickname')
          .setStyle('SHORT')
          .setLabel('Nickname')
          .setDefaultValue(birdypet.nickname || "")
          .setRequired(false)
        )
        .addComponents(
          new TextInputComponent()
          .setCustomId('birdypet_description')
          .setStyle('LONG')
          .setLabel('Description')
          .setDefaultValue(birdypet.description || "")
          .setRequired(false)
        );

      showModal(modal, {
        client: interaction.client,
        interaction: interaction
      }).catch((err) => {
	      console.log(err);
      });
    });
  } else if (interaction.type == 'MODAL_SUBMIT') {
    await interaction.deferReply();

    await axios.patch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/${interaction.message.id}`, {
      flags: 64,
      content: '*Saving changes...*',
      components: null
    }).then(() => {
      API.call('birdypet', 'PUT', {
        loggedInUser: {
          auth: 'discord',
          token: interaction.user.id
        },
        birdypet: birdypet,
        nickname: interaction.getTextInputValue('birdypet_nickname'),
        description: interaction.getTextInputValue('birdypet_description')
      }).then((response) => {
        if (response == 'OK') {
          API.call('birdypet', 'GET', {
            id: birdypet
          }).then((birdypet) => {
            axios.delete(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`);

            axios.patch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/${interaction.message.id}`, {
              flags: 64,
              content: 'Your BirdyPet has been updated!',
              embeds: [{
                title: birdypet.nickname || birdypet.bird.commonName,
                description: birdypet.description,
                image: {
                  url: birdypet.variant.image
                },
                url: `https://squawkoverflow.com/birdypet/${birdypet.id}`
              }],
              components: interaction.message.components
            });
          });
        } else {
          throw err;
        }
      }).catch((err) => {
        interaction.reply({
          content: 'big oops'
        });
      });
    });
  }
};
