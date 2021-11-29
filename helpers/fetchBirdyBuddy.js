const Redis = require('./redis.js');
const BirdyPets = require('/var/www/squawkoverflow/helpers/birdypets.js');

module.exports = function(memberId) {
return new Promise(async (resolve, reject) => {
  var member = await Redis.get('member', memberId);

  if (member && member.birdyBuddy) {
    var birdyBuddy = await Redis.get('memberpet', member.birdyBuddy);

    if (birdyBuddy) {
      birdyBuddy.birdypet = BirdyPets.get(birdyBuddy.birdypetId);

      if (!birdyBuddy.nickname) {
        birdyBuddy.nickname = birdyBuddy.birdypet.species.commonName;
      }
    }

    resolve(birdyBuddy);
  } else {
    resolve();
  }
});
};
