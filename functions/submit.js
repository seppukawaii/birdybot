const Helpers = require('../helpers.js');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdy-blogs'
});

module.exports = async function (interaction) {
    var blog = await Helpers.fetchBirdBlog(interaction.options.getString('blog'));
    var source = interaction.options.getString('url');
    var bird = Helpers.parseSpeciesCode(interaction.options.getString('speciescode'));
    var userId = interaction.user.id;

    try {
      bird = Helpers.fetchBirdBy('speciesCode', bird);
    } catch (err) {
      bird = null;
    }
	
    var photo = await Helpers.fetchBirdPhoto(source, bird ? bird.speciesCode : null);
    var query = DB.createQuery('Photo').filter('source', '=', photo.source);
    var results = await DB.runQuery(query).then((results) => results[0]);

    if (results.length > 0) {
      var key = results[0][DB.KEY];
      var flocks = results[0].flocks ? results[0].flocks : [];
      var submittedAt = results[0].submittedAt;
    } else {
      var key = DB.key(['Photo']);
      var flocks = [];
      var submittedAt = Date.now();
    }

    try {
      photo.flocks = [...new Set([...flocks, blog.name])];
      photo.submittedBy = userId;
      photo.submittedAt = submittedAt;

      DB.upsert({
        "key": key,
        "data": photo
      }).then(async (result) => {
        var response = `ID: \`${key.id}\`\r\nBlogs: \`${photo.flocks.join(", ")}\`\r\nImage: ${photo.image.full}\r\nSource: <${photo.source}>`;

        if (photo.species.speciesCode) {
          response = {
            content: `${response}`
          };
        } else {
          response = {
            content: `I couldn't parse what species \` ${interaction.options.getString('speciescode')} \` is, sorry!\r\n\r\n${response}`
          };
        }

        if (photo.species.speciesCode) {
          var tags = [
            photo.species.commonName,
            photo.species.scientificName,
            photo.species.family,
            photo.species.order,
            'birds',
            photo.attribution[0]
          ];
        } else {
          var tags = [
            'birds',
            photo.attribution[0]
          ];
        }

        await interaction.editReply(response);

          if (blog.crosspost) {
            const client = blog.name == "fullfrontalbirds" ? Helpers.tumblr() : Helpers.birblr();

            var query = DB.createQuery('Birblr').filter('tumblr', '=', blog.name).filter('squawkID', '=', key.id);
            var result = await DB.runQuery(query).then((results) => results[0]);

            if (results.length > 0) {
              // already exists
            } else {
              client.createPhotoPost(blog.name, {
                type: 'photo',
                state: photo.species.speciesCode ? 'queue' : 'draft',
                tags: tags.join(',').toLowerCase(),
                source_url: photo.source,
                source: photo.image.full,
                caption: `<p>${photo.species.commonName} <i>(${photo.species.scientificName})</i></p>\r\n<p><a href="${photo.attribution[1]}">© ${photo.attribution[0]}</a></p>`
              }, (err, data) => {
                DB.upsert({
                  key: DB.key(['Birblr', data.id_string]),
                  data: {
                    tumblr: blog.name,
                    squawkID: key.id,
                    submittedBy: userId
                  }
                });
              });
            }
          }
      });
    } catch (err) {
      console.log(err);
    }
};
