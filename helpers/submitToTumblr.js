const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'squawkoverflow'
});

module.exports = function(blog, photo) {
        return new Promise( async (resolve, reject) => {
		// Save to Birblr
		// --------------
		// 
    });
};
