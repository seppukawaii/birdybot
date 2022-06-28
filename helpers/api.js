const axios = require('axios');

exports.call = (endpoint, method = "GET", data = {}) => {
  return new Promise(async (resolve, reject) => {
    const url = `https://squawkoverflow.com/api/${endpoint}`;

    const options = {
      url,
      method
    };

    if (method == "GET") {
      options.data = data;
    } else {
      options.data = data;
    }

	  console.log(options);

    axios(options).then((response) => {
	    console.log(response);
      resolve(body);
    }).catch((err) => {
	    console.log(err);
	    resolve(err);
    });
  });
}
