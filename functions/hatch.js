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
      loggedInUser: interaction.user.id,
    }).then(async (response) => {
      let eggs = response.slice(0, 5);

      for (let egg of eggs) {
        let letter = egg.adjective.slice(0, 1).toUpperCase();

        egg.emoji = await DB.get(DB.key(['Eggs', egg.adjective])).then(async ([data]) => {
		console.log(data);
          if (data) {
            return data;
          } else {
            return {
              name: '🥚'
            };
          }
        });
      }

	    console.log(eggs);

      interaction.editReply({
        content: "These eggs are almost ready to hatch!  Which one will you pick?",
        ephemeral: true,
        components: [{
          type: 1,
          components: eggs.map((egg) => {
            return {
              type: 2,
              label: `${egg.adjective} egg`,
              style: 2,
              custom_id: `eggytime_${egg.adjective}`,
              emoji: egg.emoji
            };
          })
        }]
      });
    })
    .catch((err) => {
      console.log(err);
      interaction.editReply({
        content: `*You have ${err.response.data.timeUntil} minutes before you can hatch another egg.*`,
        ephemeral: true
      });
    });
}
