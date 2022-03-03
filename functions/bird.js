const API = require('../helpers/api.js');
const request = require('request');
const cheerio = require('cheerio');

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

  request({
    url: `https://ebird.org/species/${bird.code}`,
    encoding: 'utf8',
    gzip: true,
    jar: true
  }, function(err, res, body) {
    var $ = cheerio.load(body);

    response.content += `<https://ebird.org/species/${bird.code}>`;

    response.embeds = [{
      title: bird.commonName,
      author: {
        name: bird.scientificName
      },
      description: $('meta[property="og:description"]').attr('content'),
      image: {
        url: $('meta[property="og:image"]').attr('content')
      },
      url: `https://ebird.org/species/${bird.code}`
    }];

    interaction.editReply(response);
  });
}
