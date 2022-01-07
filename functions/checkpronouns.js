const API = require('../helpers/api.js');
const pronouns = require('../data/pronouns.json');

const preferences = {
  'yes': '☑️',
  'no': '🚫',
  'neutral': '⚫'
}

module.exports = async function(interaction) {
  var memberId = interaction.targetId;

  API.call('/member/', 'GET', {
    id: memberId
  }).then((member) => {
    var preferredPronouns = Object.keys(pronouns).map((pronoun) => {
      var icon = preferences[member.pronouns[pronoun]] || preferences['neutral'];
      var label = pronouns[pronoun].pronouny && icon == preferences['yes'] ? `[${pronouns[pronoun].label}](<${pronouns[pronoun].pronouny}>)` : pronouns[pronoun].label;

      return icon + " " + label;
    });

    interaction.reply({
      content: `<@${interaction.targetId}>'s preferred pronouns are:\r\n\r\n  ` + preferredPronouns.join("\r\n  ") + "\r\n",
      ephemeral: true
    });

  });
};