const Secrets = require('../secrets.json');

module.exports = async function(interaction) {
  var suggestion = interaction.options.getString('idea');

    interaction.editReply({
      content: `<${card.url}>`,
      embeds: [{
        title: "An idea!!",
        description: `<@${interaction.user.id}> has an idea!\r\n\r\n\`${idea}\``,
        thumbnail: {
          url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/light-bulb_1f4a1.png'
        }
      }]
    });
  });
};
