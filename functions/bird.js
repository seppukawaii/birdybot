const API = require('../helpers/api.js');
const opengraph = require('open-graph');

module.exports = async function(interaction) {
  var taxonomy = interaction.options.getString('taxonomy');
  var response = {
    content: ""
  };
  var bird = await API.call('birds', 'GET', {
    taxonomy: taxonomy
  });

  if (!bird) {
    response.content = `I couldn't find any matches for \`${taxonomy}\`, so here's a totally random bird.\r\n\r\n`;

    var bird = await API.call('birds', 'GET');;
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