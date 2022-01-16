const opengraph = require('open-graph');

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
    response.content += `<https://ebird.org/species/${bird.code}>`;

    response.embeds = [{
      title: bird.commonName,
      author: {
        name: bird.scientificName
      },
      description: meta.description.trim(),
      image: {
        url: meta.image.url
      },
      url: `https://ebird.org/species/${bird.code}`
    }];

    interaction.editReply(response);
  });
}
