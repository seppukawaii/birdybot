const Helpers = require('../helpers.js');
const Secrets = require('../secrets.json');

module.exports = async function(interaction) {
  const action = interaction.customId ? interaction.customId.split('-').shift() : "view";
  const memberTreats = await Helpers.Database.get('member', interaction.user.id, 'HALLOWEEN_candy') || 0;

  const theBirds = [{
      id: "wikimedia_77fraven",
      name: "Nevermore the Common Raven",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7f/The_Natural_History_of_Selborne%2C_and_the_Naturalist%27s_Calendar_-_The_Raven.png"
    },
    {
      id: "rijksmuseum_RP-P-2000-20",
      name: "Scarecrow the Carrion Crow",
      image: "https://cdn.discordapp.com/attachments/865328600101945404/899724509354029127/rijksmuseum_rp-p-2000-20.png"
    },
    {
      id: "wikimedia_eeelyd",
      name: "Hootcifer the Eurasian Eagle-Owl",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/ee/EagleOwlLyd.jpg"
    }
  ];

  var response = "";
  var embeds = [];
  var components = [];

  switch (action) {
    case "view":
      response = "🖤🧡🖤 THE BIRDS OF HALL🎃WEEN 🖤🧡🖤\r\n";
      response += "There are three special Halloween birds that can be convinced to join your aviary... for 25 pieces of candy!\r\n\r\n";
      response += `You currently have: ${memberTreats} treat${memberTreats == 1 ? '' : 's'}`;

      components = [{
        "type": 1,
        "components": theBirds.map((bird) => {
          return {
            type: 2,
            label: bird.name,
            style: 2,
            custom_id: `redeem_exchange-${bird.id}`,
            disabled: memberTreats < 25
          }
        })
      }];
      break;
    case "exchange":
      if (memberTreats >= 25) {
        var bird = theBirds.find((bird) => `exchange-${bird.id}` == interaction.customId);
        var birdypet = Helpers.BirdyPets.fetch(bird.id);

        response = `Congratulations! ${bird.name} is now in your aviary!`;

        Helpers.Database.increment('member', interaction.user.id, 'HALLOWEEN_candy', -25);

        var key = await Helpers.Database.save('memberpet', null, {
          member: interaction.user.id,
          birdypetId: birdypet.id,
          birdypetSpecies: birdypet.species.speciesCode,
          species: birdypet.species.commonName,
          family: birdypet.species.family,
          nickname: birdypet.version,
          hatchedAt: Date.now()
        });

        interaction.client.fetchWebhook(Secrets.WEBHOOK.exchange.ID, Secrets.WEBHOOK.exchange.TOKEN).then((webhook) => {
          webhook.send({
            content: `<@${interaction.user.id}> has exchanged 25 candy for a special Halloween bird!`,
            embeds: [{
              title: birdypet.version,
              author: {
                name: interaction.member?.displayName || interaction.user.username,
                icon_url: interaction.user.avatarURL()
              },
              description: `${birdypet.species.commonName} ${birdypet.label}`,
              url: `https://squawkoverflow.com/birdypet/${key}`,
              thumbnail: {
                url: `https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`
              }
            }]
          });
        });
      } else {
        response = `Sorry, but you only have ${memberTreats} treat${memberTreats == 1 ? '' : 's'} and the special Halloween birds want 25 pieces!`;
      }
  }

  interaction.editReply({
    content: response,
    embeds: embeds,
    components: components
  });
}