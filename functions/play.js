const API = require('../helpers/api.js');
const Jimp = require('jimp');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdybot'
});

module.exports = function(interaction) {
  if (interaction.isMessageComponent()) {
    if (interaction.message) {
      let game = require(`../games/${interaction.customId.split('-').shift()}.js`);

      DB.get(DB.key(['Games', interaction.message.id])).then(([currentState]) => {
        game.process(interaction, currentState).then((gameState) => {
          DB.upsert({
            key: DB.key(['Games', interaction.message.id]),
            data: gameState
          });

          if (gameState.over) {
            var friendship = Math.round(Math.random() * (5 - 1) + 1);

            API.call('_birdybuddy', 'POST', {
              loggedInUser: interaction.user.id,
              friendship: friendship,
            }).then((birdyBuddy) => {
              if (birdyBuddy) {
                interaction.channel.createWebhook(birdyBuddy.nickname || birdyBuddy.bird.commonName, {
                  avatar: birdyBuddy.variant.image
                }).then((webhook) => {
                  webhook.send({
                    content: `That was fun!  Let's play again!!`,
                    embeds: [
                      new MessageEmbed()
                      .setTitle(`+${friendship} Friendship`)
                      .setDescription(birdyBuddy.friendshipMeter)
                      .setURL(`https://squawkoverflow.com/birdypet/${birdyBuddy.id}`)
                    ]
                  }).then(() => {
                    webhook.delete();
                  });
                });
              }
            });
          }
        });
      });
    } else {
      console.log(interaction);
    }
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
