const {
  Permissions
} = require('discord.js');

const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

const colors = require('color-name-list');

module.exports = async function(interaction) {
  const customRole = interaction.member.roles.cache.find((role) => role.permissions.equals(Permissions.FLAGS.VIEW_CHANNEL));

  if (interaction.type == 'APPLICATION_COMMAND') {
    var hex = customRole ? `#${customRole.color.toString(16)}` : 'RANDOM';
    var color = colors.find(color => color.hex === hex);

    const modal = new Modal()
      .setCustomId(`role_${Date.now()}`)
      .setTitle('Express Yourself with a Custom Role!')
      .addComponents(
        new TextInputComponent()
        .setCustomId('name')
        .setStyle('SHORT')
        .setLabel('Role Name')
        .setDefaultValue(customRole ? customRole.name : 'Birdy Buddy')
        .setRequired(true)
      )
      .addComponents(
        new TextInputComponent()
        .setCustomId('color')
        .setStyle('SHORT')
        .setLabel('Role Color (#hex or color name)')
        .setDefaultValue(color ? color.name : hex)
        .setRequired(true)
      )
      .addComponents(
        new TextInputComponent()
        .setCustomId('color-names-list')
        .setStyle('SHORT')
        .setLabel('A list of color names can be found at:')
        .setDefaultValue('https://codepen.io/meodai/full/pXNpXe')
      );

    showModal(modal, {
      client: interaction.client,
      interaction: interaction
    });
  } else if (interaction.type == 'MODAL_SUBMIT') {
    await interaction.deferReply({
      ephemeral: true
    });

    const data = {
      name: interaction.getTextInputValue('name'),
      color: interaction.getTextInputValue('color')
    };

    var color = colors.find(color => color.name.toLowerCase() === data.color.toLowerCase());

    if (color) {
      data.color = color.hex;
    }

    if (customRole) {
      customRole.setName(data.name);
      customRole.setColor(data.color);

      interaction.editReply({
        content: "Your role has been updated!",
        ephemeral: true
      });


    } else {
      interaction.guild.roles.create({
        name: data.name,
        color: data.color,
        hoist: true,
	      position: 5,
        permissions: [Permissions.FLAGS.VIEW_CHANNEL]
      }).then((role) => {
        interaction.member.roles.add(role).then(() => {
          interaction.editReply({
            content: "Your role has been updated!",
            ephemeral: true
          });
        });
      }).catch((err) => {
        console.log(err);
      });
    }
  }
}
