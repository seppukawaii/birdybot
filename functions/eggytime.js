const Helpers = require('../helpers.js');

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const adjective = interaction.customId;

  do {
    var bird = Helpers.Birds.random('adjectives', adjective);

    try {
      var birdypet = Helpers.Chance.pickone(Helpers.BirdyPets.findBy('speciesCode', bird.speciesCode).filter((birdypet) => !birdypet.special));
    } catch (err) {
      console.log(bird.speciesCode);
    }
  } while (!birdypet)

  var hasSpecies = "";
  var hasVariant = "";

  await Helpers.Database.fetchOne({
    kind: 'memberpet',
    filters: [{
        field: 'member',
        value: memberId
      },
      {
        field: 'birdypetSpecies',
        value: bird.speciesCode
      }
    ]
  }).then((result) => {
    if (result) {
      hasSpecies = "✅";
    }
  });

  await Helpers.Database.fetchOne({
    kind: 'memberpet',
    filters: [{
        field: 'member',
        value: memberId
      },
      {
        field: 'birdypetId',
        value: birdypet.id
      }
    ]
  }).then((result) => {
    if (result) {
      hasVariant = "✅";
    }
  });

  interaction.editReply({
    content: `You hatched the ${adjective} egg to discover the **${birdypet.species.commonName}** inside!  Do you want to keep it or release it into the wild?`,
    ephemeral: true,
    "embeds": [{
      "title": `${hasSpecies} ${birdypet.species.commonName}`,
      "url": `https://squawkoverflow.com/birdypedia/bird/${birdypet.species.speciesCode}`,
      "description": `${hasVariant} ${birdypet.version || ""} ${birdypet.label || ""}`,
      "image": {
        "url": `https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`
      }
    }],
    "components": [{
      "type": 1,
      "components": [{
          "type": 2,
          "label": "Keep",
          "style": 1,
          "custom_id": `birdypets_keep-${birdypet.id}`,
          "emoji": {
            "name": "❤️"
          }
        },
        {
          "type": 2,
          "label": "Release",
          "style": 1,
          "custom_id": `birdypets_release-${birdypet.id}`,
          "emoji": {
            "name": "👋"
          }
        }
      ]
    }]
  });
};
