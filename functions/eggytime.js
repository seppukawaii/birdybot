const API = require('../helpers/api.js');

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const egg = interaction.customId;

  API.call('hatch', 'POST', {
	  loggedInUser: { auth: 'discord', token : memberId },
    egg: egg
  }).then(async (bird) => {
	  var details = [];

	  if (bird.owned > 1) {
		  details.push('✅✅ You have more than one of this species');
	  }
	  else if (bird.owned == 1) {
		  details.push('✅ You have this species');
	  }

	  if (bird.wishlisted == 2) {
		  details.push('🌟 You need this bird!');
	  }
	  else if (bird.wishlisted == 1) {
		  details.push('❤️ You want this bird!');
	  }

    interaction.editReply({
      content: `You hatched the ${egg} egg to discover the **${bird.commonName}** inside!  Do you want to keep it or release it into the wild?`,
      ephemeral: true,
      "embeds": [{
        "title": bird.commonName,
        "url": `https://squawkoverflow.com/birdypedia/bird/${bird.code}`,
        "description": details.join("\r\n"),
        "image": {
          "url": bird.variants[0].image
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
