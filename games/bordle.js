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
      var words = ['adult', 'anger', 'apple', 'beach', 'birds', 'brain', 'bread', 'brown', 'chest', 'coast', 'cover', 'cream', 'crowd', 'crown', 'cycle', 'dance', 'draft', 'drama', 'dream', 'drink', 'earth', 'enemy', 'event', 'field', 'fight', 'focus', 'force', 'frame', 'front', 'fruit', 'grass', 'green', 'group', 'heart', 'house', 'image', 'knife', 'match', 'month', 'music', 'night', 'noise', 'north', 'order', 'party', 'place', 'plant', 'pound', 'power', 'prize', 'queen', 'range', 'right', 'river', 'round', 'sense', 'shape', 'sight', 'sound', 'south', 'speed', 'spite', 'stone', 'stuff', 'style', 'thing', 'unity', 'voice', 'water', 'white', 'break', 'climb', 'fight', 'enjoy', 'drink', 'enjoy', 'relax', 'raise', 'share', 'study', 'speak', 'teach', 'crazy', 'basic', 'brown', 'large', 'happy', 'heavy', 'funny', 'giant', 'proud', 'rapid', 'quiet', 'quick', 'rough', 'royal', 'small', 'smart', 'usual', 'urban', 'rural', 'usual', 'vague', 'valid', 'vital', 'aloft', 'aptly', 'above', 'below', 'early', 'sleek', 'thick', 'goose', 'fruit', 'berry', 'chirp', 'robin', 'crane', 'hatch', 'booby', 'stork', 'chick', 'crake', 'crest', 'swift', 'hobby', 'eagle', 'pygmy', 'snipe', 'heron', 'grebe', 'owlet', 'potoo', 'mango', 'bower', 'finch', 'raven', 'junco', 'quail', 'white', 'black', 'green', 'crown', 'cheek', 'beach', 'thick', 'scrub', 'vireo', 'perch'];

      let word = Chance.pickone(words);

      resolve({
        word: word.toUpperCase(),
        guesses: []
      });
    });
  },
  play: function(interaction, currentState) {
    return new Promise(async (resolve, reject) => {

      if (interaction.customId == 'bordle-guess') {
        const modal = new Modal()
          .setCustomId(`play_bordle_${Date.now()}`)
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
      var instructions = 'Try to guess the mystery 5-letter bird word!\r\n\r\n' +
        '🟩 Green means right letter, right place.\r\n' +
        '🟦 Blue means right letter, wrong place.\r\n' +
        '⬛ Gray means wrong letter.';

      if (interaction.type == 'MODAL_SUBMIT') {
        var row = 0;

        if (gameState.over) {
          content += 'You figured out the word!';
        } else if (gameState.guesses.length >= 5) {
          gameState.over = true;

          content += `So close!  The mystery word was \`${gameState.word}\`!`;
        } else {
          content += instructions;
        }

        interaction.message.edit({
          content: content,
          components: gameState.guesses.map((guess) => {
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

              if (letter == gameState.word[i]) {
                letters[i].style = 3;
              } else if (gameState.word.includes(letter)) {
                let regex = new RegExp(letter, 'g');
                let numInGuess = (guess.slice(0, i + 1).match(regex)).length
                let numInWord = (gameState.word.match(regex)).length;
                let numCorrect = gameState.word.split('').filter((val, i) => val == letter && val == letters[i]).length;

                letters[i].style = numInGuess <= numInWord && numCorrect < numInWord ? 1 : 2;
              } else {
                letters[i].style = 2;
              }
            }

            return {
              type: 1,
              components: letters
            }
          })
        }).then(() => {
          axios.delete(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`).catch((err) => {});

          resolve(gameState);
        });
      } else if (interaction.customId == 'bordle-guess') {
        resolve(gameState);
      } else {
        content += instructions;

        interaction.editReply({
          content: content,
          components: []
        }).then(() => {
          interaction.followUp({
            content: ' ',
            components: [{
              type: 1,
              components: [{
                type: 2,
                style: 2,
                label: 'Submit Guess',
                customId: 'play_bordle-guess'
              }]
            }]
          });
          resolve(gameState);
        });
      }
    }).catch((err) => {
      console.error(err);
    });
  }
};
