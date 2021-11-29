const Helpers = require('../helpers.js');
const axios = require('axios');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

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
      var bird = Helpers.Birds.random();
      var orders = Helpers.Chance.pickset(Helpers.Birds.orders(), 5);
      var families = Helpers.Chance.pickset(Helpers.Birds.families(), 5);

      if (!orders.includes(bird.order)) {
        orders[0] = bird.order;
      }

      if (!families.includes(bird.family)) {
        families[0] = bird.family;
      }

      axios({
        url: `https://search.macaulaylibrary.org/catalog?taxonCode=${bird.speciesCode}&mediaType=p&sort=rating_rank_desc`
      }).then((response) => {
        resolve({
          bird: bird,
          photo: Helpers.Chance.pickone(response.data.results.content).mediaUrl,
          order: Helpers.Chance.shuffle(orders).map((order) => {
            return {
              label: order,
              style: 2,
              disabled: false
            }
          }),
          family: Helpers.Chance.shuffle(families).map((family) => {
            return {
              label: family,
              style: 2,
              disabled: false
            }
          }),
          round: "order"
        });
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise((resolve, reject) => {
      var clicked = currentState[currentState.round][interaction.customId.split('-').pop()];

      if (!clicked.disabled) {
        if (clicked.label == currentState.bird[currentState.round]) {
          clicked.style = 3;

          this.print(interaction, currentState, true).then(() => {
            setTimeout(function() {
	      currentState[currentState.round].forEach( (button) => {
		      button.disabled = true;
	      });

              currentState.round = currentState.round == "order" ? "family" : "done";
              return resolve(currentState);
            }, 2000);
          });
        } else {
          clicked.style = 4;
          clicked.disabled = true;

          return resolve(currentState);
        }
      } else {
        return resolve(currentState);
      }
    });
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var components = [];
      var gameOver = gameState.round == "done";
      var rows = ["order", "family"];

      for (var row of rows) {
        components.push(new MessageActionRow());

        for (var i = 0, len = gameState[row].length; i < len; i++) {
          let actionRow = components[components.length - 1];
          let button = gameState[row][i];

          actionRow.addComponents(new MessageButton({
            type: 2,
            style: button.style,
            label: button.label,
            customId: `play_whatthebird-${row}-${i}`,
            disabled: disabled ? true : button.disabled
          }));
        }

        if (gameState.round == row) {
          break;
        }
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
                .setThumbnail(birdyBuddy.birdypet.image)
              ];
            }

            interaction.editReply({
              content: `You guessed correctly!  It was the ${gameState.bird.commonName} *(${gameState.bird.scientificName})*\r\n\r\nhttps://ebird.org/species/${gameState.bird.speciesCode}`,
              components: [],
              embeds: embeds
            }).then(() => {
              resolve();
            });

            resolve();
          });
        });
      } else {
        interaction.editReply({
          content: gameOver ? "You guessed correctly!" : `Can you guess the \`${gameState.round}\` of the bird in this photo?`,
          embeds: [{
            image: {
              url: gameState.photo
            }
          }],
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
