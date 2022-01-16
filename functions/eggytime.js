const API = require('../helpers/api.js');

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const egg = interaction.customId;

  API.call('hatch', 'POST', {
    loggedInUser: memberId,
    egg: egg
  }).then(async (birdypet) => {
    interaction.editReply({
      content: `You hatched the ${egg} egg to discover the **${birdypet.bird.commonName}** inside!  Do you want to keep it or release it into the wild?`,
      ephemeral: true,
      "embeds": [{
        "title": birdypet.bird.commonName,
        "url": `https://squawkoverflow.com/birdypedia/bird/${birdypet.bird.code}`,
        "description": `${birdypet.version || ""} ${birdypet.label || ""}`,
        "image": {
          "url": birdypet.image
        }
      }],
      "components": [{
        "type": 1,
        "components": [{
            "type": 2,
            "label": "Keep",
            "style": 1,
            "custom_id": `birdypets_keep`,
            "emoji": {
              "name": "❤️"
            }
          },
          {
            "type": 2,
            "label": "Release",
            "style": 1,
            "custom_id": `birdypets_release`,
            "emoji": {
              "name": "👋"
            }
          }
        ]
      }]
    });
  });
};
