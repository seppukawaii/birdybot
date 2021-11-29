const {
    Storage
} = require('@google-cloud/storage');

const axios = require('axios');

const storage = new Storage();
const bucket = storage.bucket('squawkoverflow');

module.exports = function(url) {
        return new Promise( async (resolve, reject) => {
		if (url.startsWith('//')) {
			url = "http:" + url;
		}

                let response = await axios({
                        url: url,
                        responseType: "stream"
                });

		let filename = url.split('://', 2).pop().replace('?', '/');

		let file = bucket.file(filename);

                response.data.pipe(file.createWriteStream({
			metadata: {
				contentType: response.headers['content-type']
			}
		}));

		console.log("Saved ", url);

		// be kind, ensure no chained saving accidental DDOS
                setTimeout(resolve, 3000);
    });
};
