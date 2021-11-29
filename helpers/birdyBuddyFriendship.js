const Redis = require('./redis.js');
const Chance = require('chance').Chance();
const fetchBirdyBuddy = require('./fetchBirdyBuddy.js');

module.exports = function(memberId) {
  return new Promise(async (resolve, reject) => {
    var birdyBuddy = await fetchBirdyBuddy(memberId);

    if (birdyBuddy) {
      let friendshipGain = Math.min(100, Chance.weighted(
        [0, 1, 2, 3, 4, 5],
        [10, 8, 6, 4, 2, 1]
      ));

      var friendship = Math.max(0, birdyBuddy.friendship);

      friendship += friendshipGain;

      Redis.set('memberpet', birdyBuddy._id, {
        friendship: friendship
      }).then(() => {
        resolve(friendship < 10 ? '🤍' : ['💜', '💙', '💚', '💛', '🧡', '❤️', '💖', '💗', '💕', '💞'].slice(0, Math.floor(friendship / 10) + 1).join(""));
      });
    } else {
      resolve("");
    }
  });
};
