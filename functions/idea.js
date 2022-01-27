const Secrets = require('../secrets.json');
const Trello = require("node-trello");

module.exports = async function(interaction) {
  const trello = new Trello(Secrets.TRELLO.KEY, Secrets.TRELLO.TOKEN);
  var idea = interaction.options.getString('idea');

  trello.post("/1/cards", {
    name: idea,
    desc: `${idea}\r\n\r\nSuggested by ${interaction.member.displayName} (${interaction.user.id})`,
    idList: '616863cc740f4a0891ee0916'
  }, function(err, card) {
    if (err) {
      interaction.editReply({
        content: "Sorry, but something went wrong submitting the idea to Trello!"
      });
    }

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