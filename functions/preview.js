const Helpers = require('../helpers.js');
const opengraph = require('open-graph');

module.exports = function(interaction) {
  const url = interaction.options.getString('url');

  opengraph(url, (err, meta) => {
    response = {
      embeds: [{
        title: meta.title,
        description: meta.description ? meta.description.trim() : null,
        image: {
          url: meta.image ? meta.image.url : null
        },
        url: meta.url
      }]
    };


    interaction.editReply(response);
  });
};
