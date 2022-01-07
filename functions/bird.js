const opengraph = require('open-graph');

const Birds = require('/var/www/squawkoverflow/api/collections/birds.js');

module.exports = function(interaction) {
  var taxonomy = interaction.options.getString('taxonomy');
  var fields = ['commonName', 'scientificName', 'family', 'order'];
  var response = {
    "content": ""
  };
  var i = 0;

  if (taxonomy) {
    do {
      var birds = Birds.fetch(fields[i], taxonomy);
    }
    while (birds.length == 0 && ++i < fields.length);

    if (birds.length == 0) {
      response.content = `I couldn't find any matches for \`${taxonomy}\`, so here's a totally random bird.\r\n\r\n`;
      var bird = Birds.random();
    } else {
      var bird = birds.sort(() => .5 - Math.random())[0];
    }
  } else {
    var bird = Birds.random();
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
