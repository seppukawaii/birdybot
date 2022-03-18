const API = require('../helpers/api.js');
const Chance = require('chance').Chance();
const axios = require('axios');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

module.exports = {
  name: 'Bordle',
  process: function(interaction, currentState) {
    return new Promise((resolve, reject) => {
      if (currentState) {
        resolve(this.play(interaction, currentState));
      } else {
        resolve(this.setup(interaction));
      }
    }).then((gameState) => {
      return this.print(interaction, gameState).then((gameState) => {
        return gameState;
      });
    });
  },
  setup: function(interaction) {
    return new Promise((resolve, reject) => {
      const words = require('../data/bordle.json');

      let word = Chance.pickone(words);

      resolve({
        word: word.toUpperCase(),
        guesses: []
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise(async (resolve, reject) => {

      if (interaction.customId == 'bordle_guess') {
        const modal = new Modal()
          .setCustomId(`play_bordle-${Date.now()}`)
          .setTitle('Bordle')
          .addComponents(
            new TextInputComponent()
            .setCustomId('guess')
            .setStyle('SHORT')
            .setLabel('What is your guess?')
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true)
          );

        showModal(modal, {
          client: interaction.client,
          interaction: interaction
        });
      } else if (interaction.type == 'MODAL_SUBMIT') {
        await interaction.deferReply();

        let guess = interaction.getTextInputValue('guess').trim().toUpperCase();

        currentState.over = guess == currentState.word;

        currentState.guesses.push(guess);
      }

      return resolve(currentState);
    });
  },
  print: function(interaction, gameState, disabled = false) {
    return new Promise((resolve, reject) => {
      var content = '**🔠 Bordle 🔠**\r\n\r\n';
      var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      if (interaction.type == 'MODAL_SUBMIT') {
        var row = 0;

        if (gameState.over) {
          content += 'You figured out the word!';
        } else if (gameState.guesses.length >= 5) {
          gameState.over = true;

          content += `So close!  The mystery word was \`${gameState.word}\`!`;
        }

        var guesses = gameState.guesses.map((guess) => {
          let letters = guess.split('');

          for (let i = 0; i < 5; i++) {
            let letter = letters[i];

            letters[i] = {
              type: 2,
              style: 4,
              label: letter || ' ',
              customId: `play_bordle-${row++}${i}`,
              disabled: true
            };

            alphabet = alphabet.filter((a) => a != letter);

            console.log(letter, gameState.word[i]);

            if (letter == gameState.word[i]) {
              letters[i].style = 3;
            } else if (gameState.word.includes(letter)) {
              let numInWord = gameState.word.split('').filter((val) => val == letter).length;
              let numCorrect = gameState.word.split('').filter((val, i) => val == letter && val == letters[i]).length;
              let numSoFar = guess.slice(0, i + 1).split('').filter((val) => val == letter).length;

              letters[i].style = numSoFar <= numInWord && numCorrect < numInWord ? 1 : 2;
            } else {
              letters[i].style = 2;
            }
          }

          return {
            type: 1,
            components: letters
          }
        });

        interaction.channel.messages.fetch(gameState.message).then((message) => {
          message.edit({
            content: gameState.over ? ' ' : 'Remaining Letters:\r\n>>> ' + alphabet.join('  '),
            components: guesses
          }).then(() => {
            axios.delete(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`);

            if (gameState.over) {
              interaction.message.edit({
                content: content,
                components: []
              }).then(() => {
                interaction.channel.messages.fetch(gameState.message).then((message) => {
                  resolve(gameState);
                });
              });
            } else {
              resolve(gameState);
            }
          });
        });
      } else if (interaction.customId == 'bordle_guess') {
        resolve(gameState);
      } else {
        interaction.editReply({
          content: '**🔠 Bordle 🔠**\r\n\r\n' +
            'Try to guess the mystery 5-letter bird word!\r\n\r\n' +
            '🟩 Green means right letter, right place.\r\n' +
            '🟦 Blue means right letter, wrong place.\r\n' +
            '⬛ Gray means wrong letter.',
          components: [{
            type: 1,
            components: [{
              type: 2,
              style: 2,
              label: 'Submit Guess',
              customId: 'play_bordle_guess-MODAL'
            }]
          }]
        }).then(() => {
          interaction.followUp({
            content: 'Remaining Letters:\r\n>>> ' + (alphabet.join('  '))
          }).then((message) => {
            gameState.message = message.id;
            resolve(gameState);
          });
        });
      }
    }).catch((err) => {
      console.error(err);
    });
  }
};