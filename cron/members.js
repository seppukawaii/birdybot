const API = require('../helpers/api.js');

const secrets = require('../secrets.json');

const {
  Client,
  Intents
} = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

client.login(secrets.DISCORD.BOT_TOKEN);

client.on('error', (err) => {
  console.error(err);
});

client.on('ready', () => {
  client.guilds.fetch("863864246835216464").then((guild) => {
    const role = guild.roles.resolve('913767546048630785');

    guild.members.fetch().then((serverMembers) => {
	    API.call('members', 'GET').then( (siteMembers) => {
		    for (let i = 0, len = siteMembers.length; i < len; i++) {
			    console.log(siteMembers[i]);

			    return false;
		    }
	    });
	    /*
      members.each(async (member) => {
	      await setTimeout(function () {
		      console.log('checking ', member.id);
        API.call('member', 'GET', {
          id: member.id
        }).then((memberData) => {
          if (memberData.active) {
            API.call('member', 'PUT', {
		    loggedInUser: member.id,
              username: member.displayName,
              avatar: member.displayAvatarURL()
            });
            member.roles.add(role);
          } else {
            member.roles.remove(role);
          }
        });
	      }, 10000);
      });
		    */
    });
  });
});
