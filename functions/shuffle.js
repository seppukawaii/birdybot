const Helpers = require('../helpers.js');

module.exports = async function(interaction) {
  const blog = await Helpers.fetchBirdBlog(interaction.options.getString('blog'));

  if (blog.crosspost) {
    const client = blog.name == "fullfrontalbirds" ? Helpers.tumblr() : Helpers.birblr();

    client.addPostMethods({
      shuffleQueue: 'v2/blog/:blogIdentifier/posts/queue/shuffle',
    });

    client.shuffleQueue(blog.name, () => {
      interaction.editReply({
        content: `The queue for ${blog.name} has been shuffled!`
      });
    });
  } else {
    interaction.editReply({
      content: `${blog.name} is not connected to Tumblr (and that's okay!) and can't be shuffled.`
    });
  }
};
