const Helpers = require('../helpers');

const {
  MessageActionRow,
  MessageButton
} = require('discord.js');

module.exports = function(interaction) {
  if (interaction.isMessageComponent()) {
    Helpers.Games.process(interaction);
  } else {
    var components = [];
    var games = [{
      id: "memory",
      label: "Memory",
      emoji: {
        name: '💭'
      }
    }, {
      id: "whatthebird",
      label: "What the BIRD?!",
      emoji: {
        name: '⁉️'
      }
    }, {
      id: "birdsweeper",
      label: "Birdsweeper",
      emoji: {
        name: '🔍'
      }
    }];
	  /*{
      id: "trickortweet",
      label: "Trick or Tweet",
      emoji: {
        name: '🎃'
      }
    }];*/

    if (interaction.member?.id == "121294882861088771") {}

    for (let i = 0, len = games.length; i < len; i++) {
      if (i % 5 == 0) {
        components.push(new MessageActionRow());
      }

      let actionRow = components[components.length - 1];

      actionRow.addComponents(new MessageButton({
        type: 2,
        label: games[i].label,
        style: 2,
        customId: `play_${games[i].id}`,
        emoji: games[i].emoji
      }));
    }


    interaction.editReply({
      content: "What would you like to play?",
      components: components
    });
  }
}
