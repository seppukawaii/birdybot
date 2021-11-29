module.exports = function(key, value) {
  var birds = require('../data/birds.json');

  for (var order in birds) {
    for (var family in birds[order]) {
      for (var species of birds[order][family].children) {
        if (species[key] == value) {
          return species;
        }
      }
    }
  }

  return {};
}
