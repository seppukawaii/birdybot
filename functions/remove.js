const Helpers = require('../helpers.js');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdy-blogs'
});

module.exports = async function(interaction) {
  const blog = await Helpers.fetchBirdBlog(interaction.options.getString('blog'));
  const photoId = Helpers.parsePhotoID(interaction.options.getString('photo'));

  var results = await DB.get(DB.key(['Photo', photoId * 1]));

  if (results.length > 0) {
    var photo = results[0];

    photo.flocks = photo.flocks.filter((flock) => {
      return flock != blog.name;
    });

    DB.save(photo).then(async () => {
      if (blog.crosspost) {
        var query = DB.createQuery('Birblr').filter('tumblr', '=', blog.name).filter('squawkID', '=', photoId);
        var result = await DB.runQuery(query).then((results) => results[0]);

        if (results.length > 0) {
          const client = blog == "fullfrontalbirds" ? Helpers.tumblr() : Helpers.birblr();

          await client.deletePost(blog.name, {
            id: results[0][DB.KEY].id
          });
        }
      }

      interaction.editReply({
        "content": `Photo \`${photoId}\` has been removed from the \`${blog.name}\` flock.`
      });
    });
  } else {
    interaction.editReply({
      "content": `Sorry, but I can't find any photo with the ID \`${photoId}\`.`
    });
  }
};
