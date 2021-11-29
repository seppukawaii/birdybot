const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdy-blogs'
});

module.exports = {
  "interaction": async (GameBot) => {
    const photoId = GameBot.helpers.parsePhotoID(GameBot.req.data.options.photo);
    const species = GameBot.helpers.fetchBirdBy('speciesCode', GameBot.helpers.parseSpeciesCode(GameBot.req.data.options.speciescode));

    if (species.speciesCode) {
      var results = await DB.get(DB.key(['Photo', photoId]));

      if (results.length > 0) {
        var photo = results[0];

        photo.species = species;

        DB.save(photo).then(async () => {
          var query = DB.createQuery('Birblr').filter('squawkID', '=', `${photoId}`);
          var results = await DB.runQuery(query).then((results) => results[0]);

          if (results.length > 0) {
            var tags = [
              photo.species.commonName,
              photo.species.scientificName,
              photo.species.family,
              photo.species.order,
              'birds',
              photo.attribution[0]
            ];

            for (var i = 0, len = results.length; i < len; i++) {
              let result = results[i];
              var client = result.tumblr == "fullfrontalbirds" ? GameBot.helpers.tumblr() : GameBot.helpers.birblr();

              await new Promise((resolve, reject) => {
                client.blogPosts(result.tumblr, result[DB.KEY].name, (err, post) => {
                  client.editPost(result.tumblr, {
                    id: post.id_string,
                    tags: tags.join(', ').toLowerCase(),
                    caption: `<p>${photo.species.commonName} <i>(${photo.species.scientificName})</i></p>\r\n<p><a href="${photo.attribution[1]}">© ${photo.attribution[0]}</a></p>`,
                    state: 'queue',
                  }, (err, result) => {
                    resolve();
                  });
                });
              });
            }
          }

          GameBot.helpers.respond({
            "content": `Photo \`${photoId}\` has been updated with the species \`${species.commonName} (${species.scientificName})\`.`
          });
        });
      } else {
        GameBot.helpers.respond({
          "content": `Sorry, but I can't find any photo on with the ID \`${photoId}\`.`
        });
      }
    }
  }
};
