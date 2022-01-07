const API = require('../helpers/api.js');

const pronouns = require('../data/pronouns.json');

const preferences = {
  'yes': '☑️',
  'no': '🚫',
  'neutral': '⚫'
}

module.exports = async function(interaction) {
  var memberId = interaction.options?.getSubcommand() == 'check' ? interaction.options.getUser('user').id : (interaction.member?.id || interaction.user.id);

  API.call('member', 'GET', {
    id: memberId,
    createIfNotExists: {
	    pronouns: {}
    }
  }).then((member) => {
    if (interaction.options?.getSubcommand() == 'check') {
      var preferredPronouns = Object.keys(pronouns).map((pronoun) => {
        var icon = preferences[member.pronouns[pronoun]] || preferences['neutral'];
        var label = pronouns[pronoun].pronouny && icon == preferences['yes'] ? `[${pronouns[pronoun].label}](<${pronouns[pronoun].pronouny}>)` : pronouns[pronoun].label;

        return icon + " " + label;
      });

      interaction.editReply({
        content: `<@${memberId}>'s preferred pronouns are:\r\n\r\n  ` + preferredPronouns.join("\r\n  "),
        ephemeral: true
      });
    } else {
      var action = interaction.customId ? interaction.customId.split('-').shift() : "list";

      if (action == "toggle") {
        var pronoun = interaction.customId.split('-').pop();

        var previousState = member.pronouns[pronoun] || "neutral";
        var newState = 'yes';

        switch (previousState) {
          case "yes":
            newState = 'no';
            break;
          case "no":
            newState = "neutral";
            break;
          default:
            newState: "yes";
        }

        member.pronouns[pronoun] = newState;

        API.call('member', 'PUT', {
          loggedInUser: memberId,
          createIfNotExists: {
		  pronouns : {}
          },
          pronouns: JSON.stringify(member.pronouns)
        });
      }

      var rows = [{
        type: 1,
        components: []
      }];

      for (var pronoun in pronouns) {
        var row = rows.length - 1;

        if (rows[row].components.length == 5) {
          rows[++row] = {
            type: 1,
            components: []
          };
        }

        rows[row].components.push({
          type: 2,
          style: 2,
          label: pronouns[pronoun].label,
          customId: `pronouns_toggle-${pronoun}`,
          emoji: {
            name: preferences[member.pronouns[pronoun]] || preferences["neutral"]
          }
        });
      }

      interaction.editReply({
        content: "Select your pronoun preference.\r\n\r\n  :black_circle: = Neutral\r\n  :ballot_box_with_check: = Preferred\r\n  :no_entry_sign: = No thanks\r\n\r\nIf yours aren't listed here, please message seppukawaii to have them added!",
        components: rows
      });
    }
  });
}
