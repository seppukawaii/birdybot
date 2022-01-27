const API = require('../helpers/api.js');

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const egg = interaction.customId;

  API.call('hatch', 'POST', {
    loggedInUser: memberId,
    egg: egg
  }).then(async (birdypet) => {
	  var details = [];

	  if (birdypet.bird.owned > 1) {
		  details.push('✅✅ You have more than one of this species');
	  }
	  else if (birdypet.bird.owned == 1) {
		  details.push('✅ You have this species');
	  }

	  if (birdypet.bird.wishlisted == 2) {
		  details.push('🌟 You need this bird!');
	  }
	  else if (birdypet.bird.wishlisted == 1) {
		  details.push('❤️ You want this bird!');
	  }

    interaction.editReply({
      content: `You hatched the ${egg} egg to discover the **${birdypet.bird.commonName}** inside!  Do you want to keep it or release it into the wild?`,
      ephemeral: true,
      "embeds": [{
        "title": birdypet.bird.commonName,
        "url": `https://squawkoverflow.com/birdypedia/bird/${birdypet.bird.code}`,
        "description": details.join("\r\n"),
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
