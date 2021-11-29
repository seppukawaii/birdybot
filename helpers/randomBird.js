const Chance = require('chance').Chance();

module.exports = function(taxonomy) {
  var birds = require('../data/birds.json');
  var matchingBirds = [];

  for (let order in birds) {
    var isOrderMatch = true;
    var isFamilyMatch = true;

    if (taxonomy) {
      if (taxonomy.toLowerCase() == order.toLowerCase()) {
        isOrderMatch = true;
      } else {
        isOrderMatch = false;
      }
    }

    for (let family in birds[order]) {
      if (taxonomy) {
        if (isOrderMatch || taxonomy.toLowerCase() == family.toLowerCase()) {
          isFamilyMatch = true;
        } else {
          isFamilyMatch = false;
        }
      }

      if (isOrderMatch || isFamilyMatch) {
        matchingBirds = [...matchingBirds, ...birds[order][family].children];
      }
    }
  }

  if (matchingBirds.length == 0) {
    return false;
  } else {
    return Chance.pickone(matchingBirds);
  }
}
