const Helpers = require('../helpers.js');
const axios = require('axios');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const doorStyles = {
  closed: 2,
  revealed: 2,
  selected: 1,
  right: 3,
  wrong: 4
};

module.exports = {
  process: function(interaction, currentState) {
    return new Promise((resolve, reject) => {
      if (currentState) {
        resolve(this.play(interaction, currentState));
      } else {
        resolve(this.setup(interaction));
      }
    }).then((gameState) => {
      return this.print(interaction, gameState).then(() => {
        return gameState;
      });
    });
  },
  setup: function(interaction) {
    return new Promise((resolve, reject) => {
      resolve({
        message: "Can you find the bird's house to get a treat, or will you be tricked by knocking on a bat's door? Knock and find out!",
        doors: Helpers.Chance.shuffle([{
            state: 'closed',
            emoji: '🐦'
          },
          {
            state: 'closed',
            emoji: '🦇'
          },
          {
            state: 'closed',
            emoji: '🦇'
          }
        ]),
        round: "start"
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise((resolve, reject) => {
      var clicked = currentState.doors[interaction.customId.split('-').pop()];

      if (!clicked.disabled) {
        if (currentState.round == 'start') {
          currentState.message = "A neighboring bat opens their door to hiss at you! Are you SURE the bird is behind the door you picked? You still have time to pick the other!";
          currentState.round = 'selected';
          clicked.state = 'selected';

          var bats = Helpers.Chance.shuffle(currentState.doors.filter((door) => door.state == 'closed' && door.emoji == '🦇'));

          bats[0].state = 'revealed';
          bats[0].disabled = true;

          resolve(currentState);
        } else {
          currentState.round = "done";
          currentState.doors.map((door) => {
            door.state = 'revealed';

            return door;
          });

          if (clicked.emoji == '🐦') {
            clicked.state = 'right';

            var treats = Helpers.Chance.integer({
              min: 1,
              max: 5
            });

            Helpers.Database.increment('member', interaction.user.id, 'HALLOWEEN_candy', treats);

            currentState.message = `Yay! You found the bird's house and received ${treats} treat${treats > 1 ? 's' : ''}!`;
          } else {
            clicked.state = 'wrong';
            currentState.message = `Oh no! You knocked on the wrong door!`;
          }

          resolve(currentState);
        }
      } else {
        return resolve(currentState);
      }
    });
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var actionRow = new MessageActionRow();
      var components = [actionRow];
      var gameOver = gameState.round == "done";

      for (var i = 0, len = gameState.doors.length; i < len; i++) {
        let door = gameState.doors[i];

        actionRow.addComponents(new MessageButton({
          type: 2,
          style: doorStyles[door.state],
          label: door.state == 'closed' || door.state == 'selected' ? '🚪' : door.emoji,
          customId: `play_trickortweet-${i}`,
          disabled: gameOver ? true : door.disabled
        }));
      }

      if (gameOver) {
        Helpers.birdyBuddyFriendship(interaction.user.id).then((friendshipMeter) => {
          Helpers.fetchBirdyBuddy(interaction.user.id).then(async (birdyBuddy) => {
            var embeds = null;

            if (birdyBuddy) {
              embeds = [
                new MessageEmbed()
                .setTitle(birdyBuddy.nickname)
                .setDescription(`That was fun!  Let's play again!!`)
                .addFields({
                  name: 'Friendship',
                  value: friendshipMeter
                })
                .setURL(`https://squawkoverflow.com/birdypet/${birdyBuddy._id}`)
                .setThumbnail(birdyBuddy.birdypet.illustration)
              ];
            }

            interaction.editReply({
              content: gameState.message,
              components: components,
              embeds: embeds
            }).then(() => {
              resolve();
            });

            resolve();
          });
        });
      } else {
        interaction.editReply({
          content: gameState.message,
          components: components
        }).then(() => {
          resolve();
        });
      }
    }).catch((err) => {
      console.error(err);
    });
  }
};
