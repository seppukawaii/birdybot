module.exports = async function(interaction) {
  const roleId = '968975212831993888';

  if (interaction.member.roles.resolve(roleId)) {
    interaction.member.roles.remove(roleId);

    interaction.reply({
      content: 'You have opted out of the `Helper Birdy` role.',
      ephemeral: true
    });
  } else {
    interaction.member.roles.add(roleId);

    interaction.reply({
      content: 'You have opted in to the `Helper Birdy` role.',
      ephemeral: true
    });
  }
}
