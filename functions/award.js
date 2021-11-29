const BirdyPets = require('/var/www/squawkoverflow/helpers/birdypets.js');
const Members = require('/var/www/squawkoverflow/helpers/members.js');
const Secrets = require('../secrets.json');
const Helpers = require('../helpers.js');

module.exports = async function(message) {
  var embeds = [];

  if (message.content.includes('bug')) {
    var bugs = [
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/bug_1f41b.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/ant_1f41c.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/beetle_1fab2.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/lady-beetle_1f41e.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/cricket_1f997.png"
    ];

    message.mentions.members.each((member) => {
	    Members.get(member.id).then( (member) => {
		    Members.set(member._id, { bugs : member.bugs + 1 });
	    });

      embeds.push({
        title: "A bug!!",
        description: `<@${member.id}> found a bug!`,
        thumbnail: {
          url: Helpers.Chance.pickone(bugs)
        }
      });
    });

    message.reply({
      content: " ",
      embeds: embeds
    });
  } else if (message.content.includes('bird')) {
    try {
      var regex = /\`([^\`]+)\`/;
      var birdypet = BirdyPets.findBy('prefix-alias', message.content.match(regex)[1]);

      if (birdypet.length > 0) {
        birdypet = birdypet[0];

        for (var [id, member] of message.mentions.members) {
          var key = await Helpers.Database.save('memberpet', null, {
            member: member.id,
            birdypetId: birdypet.id,
            birdypetSpecies: birdypet.species.speciesCode,
            species: birdypet.species.commonName,
            family: birdypet.species.family,
            hatchedAt: Date.now()
          });

          embeds.push({
            title: birdypet.species.commonName,
            author: {
              name: member.displayName,
              icon_url: member.user.avatarURL()
            },
            description: `${birdypet.version || ""} ${birdypet.label || ""}`,
            url: `https://squawkoverflow.com/birdypet/${key}`,
            thumbnail: {
              url: `https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`
            }
          });
        }
      } else {
        throw 404;
      }

      message.reply({
        content: "You get a bird!!",
        embeds: embeds
      });
    } catch (err) {
      console.log(err);
      message.reply({
        content: "Sorry, I can't find the BirdyPet you're looking for."
      });
    }
  }
};
