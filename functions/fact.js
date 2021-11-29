const Helpers = require('../helpers.js');

const chance = require('chance').Chance();
const opengraph = require('open-graph');
const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

module.exports = function(interaction) {
  var taxonomy = interaction.options.getString('taxonomy');
  var bird = Helpers.randomBird(taxonomy || false);
  var response = "";

  if (!bird) {
    response = `I couldn't find any matches for \`${taxonomy}\`, so here's a totally random bird.\r\n\r\n`;
    bird = Helpers.randomBird();
  }

  opengraph(`https://ebird.org/species/${bird.speciesCode}`, (err, meta) => {
    var fact = chance.pickone(tokenizer.tokenize(meta.description));

    response += "```markdown\r\n";
    response += `${bird.commonName} (${bird.scientificName})\r\n`;
    response += "=".repeat(bird.commonName.length + bird.scientificName.length + 3);
    response += "\r\n\r\n";
    response += fact;
    response += "\r\n```";

    interaction.editReply({
      "content": response
    });
  });
};
