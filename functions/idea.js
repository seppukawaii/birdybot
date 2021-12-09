const Secrets = require('../secrets.json');
const Trello = require("node-trello");

module.exports = async function(interaction) {
  const trello = new Trello(Secrets.TRELLO.KEY, Secrets.TRELLO.TOKEN);
  var idea = interaction.options.getString('idea');

  trello.post("/1/cards", {
    name: idea,
    desc: `Suggested by ${interaction.member.displayName} (${interaction.user.id})`,
    idList: '616863cc740f4a0891ee0916'
  }, function(err, card) {
    if (err) {
      interaction.editReply({
        content: "Sorry, but something went wrong submitting the idea to Trello!"
      });
    }

    interaction.editReply({
      content: card.url
    });
  });
};
