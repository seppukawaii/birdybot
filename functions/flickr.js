const API = require('../helpers/api.js');
const Chance = require('chance').Chance();
const secrets = require('../secrets.json');
const Flickr = require('flickr-sdk');


module.exports = async function(interaction) {
  const flickr = new Flickr(secrets.FLICKR.API_KEY);
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

  await flickr.photos.search({
    text: bird.scientificName
  }).then(function(res) {
    foundPhotos = res.body.photos.photo;

    if (foundPhotos.length > 0) {
      var photo = Chance.pickone(foundPhotos);

      response.content += `${bird.commonName} *(${bird.scientificName})*\r\n\r\nhttps://www.flickr.com/photos/${photo.owner}/${photo.id}`;
    } else {
      response.content += `I couldn't find any photos of ${bird.commonName} *(${bird.scientificName})*... sorry!`;
    }

    interaction.editReply(response);
  });
};
