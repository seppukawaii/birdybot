const secrets = require('../secrets.json');
const axios = require('axios');
const chance = require('chance').Chance();

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const actions = ["Peck", "Caw", "Hop"];

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
      axios.get(`https://api.tumblr.com/v2/blog/birds-in-trees.tumblr.com/info?api_key=${secrets.TUMBLR.KEY}`).then((response) => {
        resolve(this.getBird({
          message: "Try to climb as high as you can before you run out of energy!",
          totalBirds: response.data.response.blog.total_posts - 1,
          energy: 10,
          branches: 0,
          round: 0
        }));
      });
    });
  },
  getBird: function(currentState) {
    return new Promise((resolve, reject) => {
      axios.get(`https://api.tumblr.com/v2/blog/birds-in-trees.tumblr.com/posts?api_key=${secrets.TUMBLR.KEY}&offset=${chance.integer({ min : 0, max : currentState.totalBirds })}`).then((response) => {
        var bird = response.data.response.posts[0];
        var name = bird.summary.match(/([^(]+) \(/);

        name = name.length > 0 ? name[1] : "Bird";

        var digits = name.split('').map((char) => char.charCodeAt(0) % 3).join('');

        currentState.bird = {
          image: bird.photos[0].original_size.url,
          name: name,
          digits: digits,
          energy: (digits.slice(0, 1) * 1) + 1
        };

        return resolve(currentState);
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise(async (resolve, reject) => {
      let you = interaction.customId.split('_').pop();
      let bird = actions[currentState.bird.digits.slice(currentState.round, currentState.round + 1) * 1];

      switch (`${you}-${bird}`) {
        case 'peck-Peck':
          currentState.message = 'You peck each other!';
          currentState.energy -= 1;
          currentState.bird.energy -= 1;
          break;
        case 'peck-Caw':
          currentState.message = `You peck the ${currentState.bird.name} when it tries to caw!`;
          currentState.bird.energy -= 2;
          break;
        case 'peck-Hop':
          currentState.message = `You try to peck the ${currentState.bird.name}, but it hops out of the way!`;
          currentState.energy -= 2;
          break;
        case 'caw-Peck':
          currentState.message = `You try to caw, but the ${currentState.bird.name} pecks you!`;
          currentState.energy -= 2;
          break;
        case 'caw-Caw':
          currentState.message = `You caw at each other!`;
          currentState.energy -= 1;
          currentState.bird.energy -= 1;
          break;
        case 'caw-Hop':
          currentState.message = `You caw loudly, throwing the ${currentState.bird.name} off balance when it tries to hop!`;
          currentState.bird.energy -= 2;
          break;
        case 'hop-Peck':
          currentState.message = `You hop out of the way of the ${currentState.bird.name}'s peck!`;
          currentState.bird.energy -= 2;
          break;
        case 'hop-Caw':
          currentState.message = `You try to hop, but the ${currentState.bird.name} caws and you lose your balance!`;
          currentState.energy -= 2;
          break;
        case 'hop-Hop':
          currentState.message = `You hop at the same time!`;
          currentState.energy -= 1;
          currentState.bird.energy -= 1;
          break;
      }

      if (currentState.energy <= 0) {
        currentState.over = true;
        currentState.message += `\r\n\r\nYou are exhausted... well, ${currentState.branches} branches high is okay for now.`;
      } else if (currentState.bird.energy <= 0) {
        currentState.branches++;
        currentState.round = 0;
        currentState.message += `\r\n\r\nYou are victorious, and are now ${currentState.branches} branches high!`;

        await this.getBird(currentState);
      } else {
        currentState.round++;
      }

      return resolve(currentState);
    });
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var content = '<:treeclimber:957815723873427506>   **Treeclimber**\r\n\r\n';
      var components = [new MessageActionRow(), new MessageActionRow()];

      components[0].addComponents(new MessageButton({
        type: 2,
        label: 'Your Energy: ' + (gameState.energy > 0 ? Array(gameState.energy).fill('⚡').join('') : '💤'),
        style: 2,
        customId: 'play_treeclimber_energy',
        disabled: true
      }));

      if (!gameState.over) {
        for (let action of actions) {
          components[1].addComponents(new MessageButton({
            type: 2,
            label: action,
            style: 1,
            customId: `play_treeclimber_${action.toLowerCase()}`
          }));
        }
      } else {
        components.pop();
      }

      interaction.editReply({
        content: content + gameState.message,
        embeds: gameState.over ? null : [{
          title: `Branch #${gameState.branches + 1} - ` + gameState.bird.name,
          description: 'A bird blocks you from climbing higher!',
          fields: [{
            name: 'Energy',
            value: '`' + Array(gameState.bird.energy).fill('⚡').join('') + '`'
          }],
          image: {
            url: gameState.bird.image
          }
        }],
        components: components
      }).then(() => {
        resolve();
      });
    }).catch((err) => {
      console.error(err);
      resolve();
    });
  }
};
