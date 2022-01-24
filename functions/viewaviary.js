module.exports = function (interaction) {
  interaction.editReply({
    content: `https://squawkoverflow.com/aviary/${interaction.targetId}`,
    ephemeral: true
  });
};
