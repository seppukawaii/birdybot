const Secrets = require('../secrets.json');
const Helpers = require('../helpers.js');
const Flickr = require('flickr-sdk');

module.exports = async function(interaction) {
  const flickr = new Flickr(Secrets.FLICKR.API_KEY);
  var foundPhotos = [];

  do {
    var bird = Helpers.randomBird();

    await flickr.photos.search({
      text: bird.scientificName
    }).then(function(res) {
      foundPhotos = res.body.photos.photo;

      if (foundPhotos.length > 0) {
        var photo = Helpers.Chance.pickone(foundPhotos);

        interaction.editReply({
          content: `${bird.commonName} *(${bird.scientificName})*\r\n\r\nhttps://www.flickr.com/photos/${photo.owner}/${photo.id}`
        });
      }
    });
  } while (foundPhotos.length == 0)
};
