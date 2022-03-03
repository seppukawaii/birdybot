const API = require('../helpers/api.js');
const axios = require('axios');
const opengraph = require('open-graph');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

module.exports = {
	name: 'What the BIRD?!',
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
      API.call('birds', 'GET').then(async (bird) => {
        var orders = await API.call('orders', 'GET').then((results) => {
          results = results.map((result) => result.name).sort(() => Math.random() - 0.5).slice(0, 5);

          if (!results.includes(bird.order)) {
            results[0] = bird.order;
          }

          return results.sort(() => Math.random() - 0.5);
        });

        var families = await API.call('families', 'GET').then((results) => {
          results = results.map((result) => result.name).sort(() => Math.random() - 0.5).slice(0, 5);

          if (!results.includes(bird.family)) {
            results[0] = bird.family;
          }

          return results.sort(() => Math.random() - 0.5);
        });

        axios({
          url: `https://search.macaulaylibrary.org/catalog?taxonCode=${bird.code}&mediaType=p&sort=rating_rank_desc`
        }).then((response) => {
          let photos = response.data.results.content;

          if (photos.length <= 10) {
            return resolve(this.setup(interaction));
          }

          photos.sort(() => Math.random() - 0.5);

          resolve({
            bird: bird,
            photo: photos[0].mediaUrl,
            order: orders.map((order) => {
              return {
                label: order,
                style: 2,
                disabled: false
              }
            }),
            family: families.map((family) => {
              return {
                label: family,
                style: 2,
                disabled: false
              }
            }),
            round: "order"
          });
        }).catch( (err) => {
		resolve(this.setup(interaction));
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
              currentState[currentState.round].forEach((button) => {
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
      var rows = ["order", "family"];

      gameState.over = gameState.round == "done";

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
      if (gameState.over) {
        opengraph(`https://ebird.org/species/${gameState.bird.code}`, (err, meta) => {
          interaction.editReply({
            content: `You guessed correctly!`,
            components: components,
            embeds: [{
              title: gameState.bird.commonName,
              author: {
                name: gameState.bird.scientificName
              },
              description: meta.description.trim(),
              thumbnail: {
                url: gameState.photo
              },
              image: {
                url: meta.image.url
              },
              url: `https://ebird.org/species/${gameState.bird.code}`
            }]
          }).then(() => {
            resolve();
          });
        });
      } else {
        interaction.editReply({
          content: gameState.over ? "You guessed correctly!" : `Can you guess the \`${gameState.round}\` of the bird in this photo?`,
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
