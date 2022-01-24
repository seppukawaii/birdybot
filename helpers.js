const secrets = require('./secrets.json');
const Chance = require('chance').Chance();
const tumblr = require('tumblr.js');

module.exports = {
  Chance: Chance,

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

  parseSpeciesCode: function(input) {
    try {
      const regex = /(https:\/\/ebird.org\/species\/)?([A-Za-z0-9]+)/gm;

      let tmp = input.match(regex);

      return tmp[0].split('/').pop();
    } catch (err) {
      return null;
    }
  },

  fetchBirdPhoto: require('./helpers/fetchBirdPhoto'),
  fetchBirdBlog: require('./helpers/fetchBirdBlog'),
  saveBirdPhoto: require('./helpers/saveBirdPhoto'),

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
