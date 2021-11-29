const secrets = require('./secrets.json');
const Chance = require('chance').Chance();
const tumblr = require('tumblr.js');
const StormDB = require('stormdb');

module.exports = {
  Chance: Chance,
  Database: require('./helpers/redis.js'),
  Games: require('./helpers/games.js'),

  clearMessages: async function(channel) {
    return new Promise((resolve, reject) => {
      channel.bulkDelete(100)
        .then((messages) => {
          if (messages.size == 100) {
            resolve(this.clearMessages(channel));
          } else {
            resolve();
          }
        });
    });
  },

  randomBird: require('./helpers/randomBird.js'),

  parseSpeciesCode: function(input) {
    try {
      const regex = /(https:\/\/ebird.org\/species\/)?([A-Za-z0-9]+)/gm;

      let tmp = input.match(regex);

      return tmp[0].split('/').pop();
    } catch (err) {
      return null;
    }
  },

  parsePhotoID: function(input) {
    try {
      const regex = /(https:\/\/squawkoverflow.com\/photoss\/)?([A-Za-z0-9]+)/gm;

      let tmp = input.match(regex);

      return tmp[0].split('/').pop() * 1;
    } catch (err) {
      return null;
    }
  },

  Birds: require('/var/www/squawkoverflow/helpers/birds.js'),
  BirdyPets: require('/var/www/squawkoverflow/helpers/birdypets.js'),

  fetchBirdBy: require('./helpers/fetchBirdBy'),
  fetchBirdPhoto: require('./helpers/fetchBirdPhoto'),
  fetchBirdBlog: require('./helpers/fetchBirdBlog'),
  saveBirdPhoto: require('./helpers/saveBirdPhoto'),
  fetchBirdyBuddy: require('./helpers/fetchBirdyBuddy'),
  birdyBuddyFriendship: require('./helpers/birdyBuddyFriendship'),

  pronouns: async function(member, pronounCase) {
    var pronouns = require('./data/pronouns.json');

    try {
      for (let key in member.pronouns) {
        if (member.pronouns[key] == "yes") {
          return pronouns[key].cases[pronounCase];
        }
      }

    } catch (err) {
	    console.log(err);
    }
    return pronouns["they"].cases[pronounCase];
  },

  sleep: function(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  },

  tumblr: function() {
    const client = tumblr.createClient({
      consumer_key: secrets.TUMBLR.consumer_key,
      consumer_secret: secrets.TUMBLR.consumer_secret,
      token: secrets.TUMBLR.token,
      token_secret: secrets.TUMBLR.token_secret
    });

    return client;
  },

  birblr: function() {
    const client = tumblr.createClient({
      consumer_key: secrets.BIRBLR.consumer_key,
      consumer_secret: secrets.BIRBLR.consumer_secret,
      token: secrets.BIRBLR.token,
      token_secret: secrets.BIRBLR.token_secret
    });

    return client;
  }
}
