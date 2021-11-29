const axios = require('axios');
const cheerio = require('cheerio');

const fetchBirdBy = require('../helpers/fetchBirdBy');

module.exports = function(url, speciesCode) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(async (response) => {
        var output = {};

        switch (response.request.connection._host) {
          case 'macaulaylibrary.org':
            output.source = response.data.specimenUrl;
            output.image = {
              full: response.data.largeUrl,
              thumbnail: response.data.largeUrl.replace(/\/[0-9]+$/, "/480")
            };
            output.species = speciesCode && speciesCode != "" ? speciesCode : response.data.ebirdSpeciesUrl.split('/').pop();
            output.attribution = [
              response.data.userDisplayName,
              response.data.userProfileUrl || `https://search.macaulaylibrary.org/catalog?userId=${response.data.userId}&searchField=user`
            ];
            break;
          case 'flickr.com':
          case 'www.flickr.com':
            var $ = cheerio.load(response.data);

            output.source = $('meta[property="og:url"]').attr('content');
            output.image = {
              full: $('meta[property="og:image"]').attr('content'),
              thumbnail: "http:" + $('img.low-res-photo').attr('src')
            };
            output.attribution = [
              $('a.owner-name').html(),
              `https://flickr.com${$('a.owner-name').attr('href')}`
            ];
            output.species = speciesCode;
            break;
          case 'unsplash.com':
          case 'www.unsplash.com':
            var $ = cheerio.load(response.data);

            output.source = $('meta[property="og:url"]').attr('content');

            var image = $('meta[property="og:image:secure_url"]').attr('content').split('?crop').shift();

            output.image = {
              full: image + '?w=1080',
              thumbnail: image + '?w=480'
            };

            output.attribution = [
              $('meta[property="og:title"]').attr('content').replace('Photo by', '').replace('on Unsplash', '').trim(),
              "https://unsplash.com/" + $('meta[name="twitter:creator"]').attr('content')
            ];

            output.species = speciesCode;

            break;
          case 'danielslim.com':
          case 'www.danielslim.com':
            var $ = cheerio.load(response.data);
            output.source = $('meta[property="og:url"]').attr('content');
            output.image = {
              full: $('meta[property="og:image"]').attr('content'),
              thumbnail: $('meta[property="og:image"]').attr('content').replace(/\.jpg$/, "-300x300.jpg")
            };
            output.attribution = [
              "Daniel Swee H Lim",
              "http://www.danielslim.com/"
            ];
            output.species = speciesCode;
            break;
          case 'pbase.com':
          case 'www.pbase.com':
            var $ = cheerio.load(response.data);
            output.source = $('meta[property="og:url"]').attr('content');
            output.image = {
              full: $('img', '#image').attr('src'),
              thumbnail: $('meta[property="og:image"]').attr('content')
            };
            output.attribution = [
              $('a', '#localmenu').first().text(),
              "https://www.pbase.com" + $('a', '#localmenu').first().attr('href')
            ];
            output.species = speciesCode;
            break;
          default:
            return reject("That host isn't supported yet.");
            break;
        }

        output.species = fetchBirdBy('speciesCode', output.species);

        resolve(output);
      })
      .catch((err) => {
        return reject(`I was unable to access \`${url}\``);
      });
  });
};
