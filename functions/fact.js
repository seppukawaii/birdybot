const API = require('../helpers/api.js');

const request = require('request');
const cheerio = require('cheerio');
const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

module.exports = async function(interaction) {
  var taxonomy = interaction.options.getString('taxonomy');
  var response = {
    content: ""
  };
  var bird = await API.call('bird', 'GET', {
    taxonomy: taxonomy
  });

  if (!bird) {
    response.content = `I couldn't find any matches for \`${taxonomy}\`, so here's a totally random bird.\r\n\r\n`;

    var bird = await API.call('bird', 'GET');
  }

  request({
    url: `https://www.allaboutbirds.org/guide/${bird.commonName.replace(/\s/g, '_')}`,
    encoding: 'utf8',
    gzip: true,
    jar: true,
    headers: {
      'User-Agent': 'NodeOpenGraphCrawler (https://github.com/samholmes/node-open-graph)'
    }
  }, async function(err, res, body) {
    var $ = cheerio.load(body);
    var facts = [];

    $('li[data-accordion-item]:contains("Cool Facts") div.accordion-content li').each(function(i, elem) {
      facts.push($(elem).text());
    });

    if (facts.length == 0) {
      facts = await new Promise((resolve, reject) => {
        request({
          url: `https://ebird.org/species/${bird.code}`,
          encoding: 'utf8',
          gzip: true,
          jar: true
        }, function(err, res, body) {
          var $ = cheerio.load(body);

          resolve(tokenizer.tokenize($('meta[property="og:description"]').attr('content')));
        });
      });
    }

    facts.sort(() => Math.random() - 0.5);

    var fact = facts.length > 0 ? facts[0] : "A bird.";

    response.content += "```markdown\r\n";
    response.content += `${bird.commonName} (${bird.scientificName})\r\n`;
    response.content += "=".repeat(bird.commonName.length + bird.scientificName.length + 3);
    response.content += "\r\n\r\n";
    response.content += fact;
    response.content += "\r\n```";

    interaction.editReply(response);
  });
};
