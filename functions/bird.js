const Helpers = require('../helpers.js');
const opengraph = require('open-graph');

module.exports = function(interaction) {
  var taxonomy = interaction.options.getString('taxonomy');
  var fields = ['commonName', 'scientificName', 'family', 'order'];
  var response = {
    "content": ""
  };
  var i = 0;

  if (taxonomy) {
    do {
      var birds = Helpers.Birds.fetch(fields[i], taxonomy);
    }
    while (birds.length == 0 && ++i < fields.length);

    if (birds.length == 0) {
      response.content = `I couldn't find any matches for \`${taxonomy}\`, so here's a totally random bird.\r\n\r\n`;
      var bird = Helpers.randomBird();
    } else {
      var bird = Helpers.Chance.pickone(birds);
    }
  } else {
    var bird = Helpers.randomBird();
  }

  opengraph(`https://ebird.org/species/${bird.speciesCode}`, (err, meta) => {
    response.content += `<https://ebird.org/species/${bird.speciesCode}>`;

    response.embeds = [{
      title: bird.commonName,
      author: {
        name: bird.scientificName
      },
      description: meta.description.trim(),
      image: {
        url: meta.image.url
      },
      url: `https://ebird.org/species/${bird.speciesCode}`
    }];

    interaction.editReply(response);
  });
}