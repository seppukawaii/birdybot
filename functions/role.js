const {
  Permissions
} = require('discord.js');

module.exports = function(interaction) {
  var action = interaction.options.getSubcommand('action');
  var value = interaction.options.getString(action);
  var customRoleFound = false;

  if (action == 'color') {
    const colors = require('color-name-list');
    const color = colors.find(color => color.name.toLowerCase() === value.toLowerCase());

    if (color) {
      value = color.hex;
    }
  }

  interaction.member.roles.cache.some((role) => {
    if (role.permissions.equals(Permissions.FLAGS.VIEW_CHANNEL)) {
      customRoleFound = true;

      role['set' + (action == "name" ? "Name" : "Color")](value);

      interaction.editReply({
        content: "Your role has been updated!",
        ephemeral: true
      });
    }

    return customRoleFound;
  });

  if (!customRoleFound) {
    interaction.guild.roles.create({
      name: action == 'name' ? value : "new bird buddy",
      color: action == 'color' ? value : 'RANDOM',
      hoist: true,
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
