const Secrets = require('../secrets.json');
const Trello = require("node-trello");

module.exports = function(interaction) {
  const trello = new Trello(Secrets.TRELLO.KEY, Secrets.TRELLO.TOKEN);
  var report = interaction.options.getString('report');

  trello.post("/1/cards", {
    name: report,
    desc: `Reported by ${interaction.member.displayName} (${interaction.user.id})`,
    idList: '616863d9071f1c88feb22769'
  }, function(err, card) {
    if (err) {
      interaction.editReply({
        content: "Sorry, but something went wrong submitting the bug report to Trello!"
      });
    }

    interaction.editReply({
      content: card.url
    });
  });
}
