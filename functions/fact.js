const chance = require('chance').Chance();
const opengraph = require('open-graph');
const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

// TODO - replace with API call
const Birds = require('/var/www/squawkoverflow/api/collections/birds.js');

module.exports = async function(interaction) {
  var taxonomy = interaction.options.getString('taxonomy');
  var fields = ['commonName', 'scientificName', 'family'];
  var response = {
    "content": ""
  };
  var i = 0;

  if (taxonomy) {
    var birds = await Birds.fetch('*', taxonomy);

    if (birds.length == 0) {
      response.content = `I couldn't find any matches for \`${taxonomy}\`, so here's a totally random bird.\r\n\r\n`;

      var bird = await Birds.random();
    } else {
      var bird = birds.sort(() => .5 - Math.random())[0];
    }
  } else {
    var bird = await Birds.random();
  }

  opengraph(`https://ebird.org/species/${bird.code}`, (err, meta) => {
    var fact = chance.pickone(tokenizer.tokenize(meta.description));

    response.content += "```markdown\r\n";
    response.content += `${bird.commonName} (${bird.scientificName})\r\n`;
    response.content += "=".repeat(bird.commonName.length + bird.scientificName.length + 3);
    response.content += "\r\n\r\n";
    response.content += fact;
    response.content += "\r\n```";

    interaction.editReply(response);
  });
};
