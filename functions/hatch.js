const API = require('../helpers/api.js');
const secrets = require('../secrets.json');

const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'birdybot'
});

module.exports = function(interaction) {
  API.call('hatch', "GET", {
      loggedInUser: {
        auth: 'discord',
        token: interaction.user.id
      },
    }).then(async (response) => {
      let eggs = [];

      for (let egg of response) {
        let letter = egg.adjective.slice(0, 1).toUpperCase();

        let emoji = await DB.get(DB.key(['Eggs', egg.adjective])).then(async ([data]) => {
          if (data) {
            return data;
          } else {
            return {
              name: '🥚'
            };
          }
        });

        eggs.push({
          type: 2,
          label: `${egg.adjective}` + (egg.hasOwnProperty('numHatched') ? `   (${egg.numHatched}/${egg.numSpecies})` : ''),
          style: 2,
          custom_id: `birdypets/hatched_${egg.adjective}`,
          emoji: emoji
        });
      }

      interaction.editReply({
        content: "These eggs are almost ready to hatch!  Which one will you pick?",
	      embeds: [],
        components: [{
          type: 1,
          components: eggs.slice(0, 3).filter((egg) => typeof egg != "undefined")
        }, {
          type: 1,
          components: eggs.slice(3, 6).filter((egg) => typeof egg != "undefined")
        }]
      });
    })
    .catch((err) => {
      if (err.response) {
        interaction.editReply({
          content: `*You have ${err.response.data.timeUntil} minutes before you can hatch another egg.*`
        });
      } else {
        console.log(err);

        interaction.editReply({
          content: '*Something went wrong!  Please file a \`/bug\` report.  Sorry for the inconvenience!*'
        });
      }
    });
}
