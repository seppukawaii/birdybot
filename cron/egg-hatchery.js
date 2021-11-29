const {
  v1
} = require('@google-cloud/pubsub');

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  WebhookClient
} = require('discord.js');

const secrets = require('../secrets.json');
const BirdyPets = require('/var/www/squawkoverflow/helpers/birdypets.js');
const Chance = require('chance').Chance();
const subClient = new v1.SubscriberClient();
const webhookClient = new WebhookClient({
  id: secrets.DISCORD.WEBHOOK['egg-hatchery'].ID,
  token: secrets.DISCORD.WEBHOOK['egg-hatchery'].TOKEN
});

async function listen() {
    const formattedSubscription = subClient.subscriptionPath(
      process.env.GCP_PROJECT,
      'squawkoverflow-egg-hatchery'
    );

    const request = {
      subscription: formattedSubscription,
      maxMessages: 5
    };

    const [response] = await subClient.pull(request);

    var ackIds = [];

    for (const message of response.receivedMessages) {
      if (!ackIds.includes(message.ackId)) {
          await messageHandler(message.message);
          ackIds.push(message.ackId);
        }
      }

      if (ackIds.length > 0) {
        const ackRequest = {
          subscription: formattedSubscription,
          ackIds: ackIds
        };

        await subClient.acknowledge(ackRequest);
      }

      process.exit(0);
    }

    function messageHandler(message) {
      return new Promise((resolve, reject) => {
        var birdypet = BirdyPets.get(message.attributes.birdypet);

        if (!birdypet) {
		birdypet = BirdyPets.findBy('alias', message.attributes.birdypet)[0];
	}

        var member = message.attributes.member;
        var adjective = message.attributes.adjective;
        var userpet = message.attributes.userpet;
        var source = message.attributes.source;
        var embeds = [
          new MessageEmbed()
          .setTitle(birdypet.species.commonName)
          .setDescription(`<@${member}> hatched the ${adjective} egg!`)
          .setURL(`https://squawkoverflow.com/birdypet/${userpet}`)
          .setImage(`https://storage.googleapis.com/birdypets/${birdypet.species.order}/${birdypet.species.family}/${birdypet.species.scientificName.replace(' ', '%20')}/${birdypet.id}.${birdypet.filetype ? birdypet.filetype : "jpg"}`)
        ];

        webhookClient.send({
          content: " ",
          embeds: embeds
        }).then(() => {
          resolve();
        });
      }).catch( (err) => {
	      console.log(err);
	      console.log(message.attributes);
      });
    }

    listen();
