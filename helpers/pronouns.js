module.exports = function(member, pronounCase) {
    var pronouns = require('../data/pronouns.json');

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
  }
