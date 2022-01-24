module.exports = function(interaction) {
  interaction.editReply({
    content: `<https://squawkoverflow.com/members/${interaction.targetId}/gift>`,
    ephemeral: true
  });
};
