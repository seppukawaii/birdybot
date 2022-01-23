module.exports = async function(interaction) {
  const target = interaction.options.getUser('user');
  var url = 'https://squawkoverflow.com';

  switch (interaction.options?.getSubcommand()) {
    case 'aviary':
      url += `/aviary/${target.id}`;
      break;
    case 'wishlist':
      url += `/wishlist/${target.id}`;
      break;
    case 'gift':
      url = `<https://squawkoverflow.com/members/${target.id}/gift>`;
      break;
    case 'notifications':
      if (interaction.guild?.id == '863864246835216464') {
        if (interaction.member.roles.resolve('913767546048630785')) {
          interaction.member.roles.remove('913767546048630785');

          interaction.editReply({
            content: 'You have opted out of the SQUAWKers role for notifications.',
            ephemeral: true
          });
        } else {
          interaction.member.roles.add('913767546048630785');

          interaction.editReply({
            content: 'You have opted in to the SQUAWKers role for notifications.',
            ephemeral: true
          });
        }
      } else {
        interaction.editReply({
          content: 'Please use this command within the Birdy Buddies server.',
          ephemeral: true
        });
      }
      return;
  }

  interaction.editReply({
    content: url,
    ephemeral: true
  });
}
