const API = require('../helpers/api.js');

module.exports = async function(message) {
  var members = message.mentions.members.map((member) => { return { auth: 'discord', token : member.id} });
  var embeds = [];
  var regex = /\`([^\`]+)\`/;
  var value = null;

  try {
    value = message.content.match(regex)[1];
  } catch (err) {}

  if (message.content.includes('bug')) {
    var bugs = [
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/bug_1f41b.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/ant_1f41c.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/beetle_1fab2.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/lady-beetle_1f41e.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/cricket_1f997.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/mosquito_1f99f.png"
    ];

    API.call('bug', 'PUT', {
      members: members,
      bugs: value ? value : 1
    });

    members = members.map((member) => `<@${member.token}>`);

    if (members.length > 1) {
      members[members.length - 1] = 'and ' + members[members.length - 1];
    }

    embeds.push({
      title: "A bug!!",
      description: `${members.join(', ')} found a bug!`,
      thumbnail: {
        url: bugs.sort(() => .5 - Math.random())[0]
      }
    });

    message.reply({
      content: " ",
      embeds: embeds
    });
  } else if (message.content.includes('bird')) {
    try {
      API.call('illustration', 'GET', {
        id: value
      }).then(async (illustration) => {

        for (var [id, member] of message.mentions.members) {
          API.call('collect', 'POST', {
		  loggedInUser: { auth : 'discord', token : member.id },
            variant: illustration.id
          });
        }

        members = members.map((member) => `<@${member}>`);

        if (members.length > 1) {
          members[members.length - 1] = 'and ' + members[members.length - 1];
        }

        embeds.push({
          title: illustration.bird.commonName,
          description: illustration.label || " ",
          url: `https://squawkoverflow.com/birdypedia/bird/${illustration.bird.id_slug}`,
          thumbnail: {
            url: illustration.image
          }
        });

        message.reply({
          content: `${members.join(', ')} get${members.length == 1 ? 's' : ''} a bird!`,
          embeds: embeds
        });
      });
    } catch (err) {
      console.log(err);
      message.reply({
        content: "Sorry, I can't find the BirdyPet you're looking for."
      });
    }
  }
};
