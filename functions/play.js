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
  if (interaction.type == 'REPLY' || interaction.isMessageComponent()) {
    if (interaction.type == 'REPLY') {
      var game = require('../games/' + interaction.message.content.split("\r\n").shift().toLowerCase().replace(/[^a-z]+/g, '') + '.js');
	    var user = interaction.reply.author.id;
    } else if (interaction.message) {
      var game = require(`../games/${interaction.customId.split('-').shift()}.js`);
	    var user = interaction.user.id;
    } else {
      return false;
    }

    DB.get(DB.key(['Games', interaction.message.id])).then(([currentState]) => {
      if (!currentState || !currentState.over) {
        game.process(interaction, currentState).then((gameState) => {
          DB.upsert({
            key: DB.key(['Games', interaction.message.id]),
            data: gameState
          });

          if (gameState.over) {
            var friendship = Math.round(Math.random() * (5 - 1) + 1);

            API.call('_birdybuddy', 'POST', {
              loggedInUser: user,
              friendship: friendship,
            }).then((birdyBuddy) => {
              if (birdyBuddy) {
                if (interaction.member || interaction.reply?.member) {
			var channel = interaction.type == 'REPLY' ? interaction.reply.channel : interaction.channel;

                  Jimp.read(birdyBuddy.variant.image).then((image) => {
                    var px = Math.max(image.bitmap.height, image.bitmap.width);

                    new Jimp(px, px, '#ffffff', (err, background) => {
                      var mimes = {
                        "jpg": "JPEG",
                        "jpeg": "JPEG",
                        "png": "PNG"
                      };

                      background.composite(image, (px - image.bitmap.width) / 2, (px - image.bitmap.height) / 2)
                        .getBase64(Jimp[`MIME_${mimes[birdyBuddy.variant.filetype]}`], (err, img) => {
                          channel.createWebhook(birdyBuddy.nickname || birdyBuddy.bird.commonName, {
                            avatar: img
                          }).then((webhook) => {
                            webhook.send({
                              content: `That was fun!  Let's play again!!`,
                              embeds: [
                                new MessageEmbed()
                                .setTitle(`+${friendship} Friendship` + (birdyBuddy.friendship >= 100 ? '(MAX)' : ''))
                                .setDescription(birdyBuddy.friendshipMeter + ' ')
                                .setURL(`https://squawkoverflow.com/birdypet/${birdyBuddy.id}`)
                              ]
                            }).then(() => {
                              webhook.delete();
                            });
                          });
                        });
                    });
                  });
                } else {
                  interaction.followUp({
                    content: ' ',
                    embeds: [
                      new MessageEmbed()
                      .setTitle(`+${friendship} Friendship`)
                      .setDescription(birdyBuddy.friendshipMeter + ' ')
                      .setURL(`https://squawkoverflow.com/birdypet/${birdyBuddy.id}`)
                      .setThumbnail(birdyBuddy.variant.image)
                      .setAuthor(birdyBuddy.nickname || birdyBuddy.bird.commonName)
                    ]
                  });
                }
              }
            });
          }

        });
      } else {
        if (interaction.type == 'REPLY') {
          interaction.reply.reply({
            content: 'That game is over, but you can /play a new one!',
            ephemeral: true
          });
        } else {
          interaction.followUp({
            content: 'That game is over, but you can /play a new one!',
            ephemeral: true
          });
        }
      }
    });
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
    }, /*{
      id: "birdsweeper",
      label: "Birdsweeper",
      emoji: {
        name: '🔍'
      }
    },*/ {
      id: 'bordle',
      label: 'Bordle',
      emoji: {
        name: '🔠'
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
