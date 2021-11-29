const {
  Datastore
} = require('@google-cloud/datastore');

const DB = new Datastore({
  namespace: 'squawkoverflow'
});

module.exports = function(blog) {
        return new Promise( async (resolve, reject) => {
		var query = DB.createQuery('Group').filter('name', '=', blog);

		DB.runQuery(query).then( ([results]) => {
			resolve(results[0]);
		});
    });
};
