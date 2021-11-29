const {
  GoogleAuth
} = require('google-auth-library');

const auth = new GoogleAuth();

exports.call = (endpoint, method = "GET", data = {}) => {
  return new Promise(async (resolve, reject) => {
    const apiPath = 'https://us-central1-bot-central.cloudfunctions.net/api';
    const client = await auth.getIdTokenClient(apiPath);
    const url = `${apiPath}/${endpoint}`;

    const options = {
      url,
      method: method,
    };

    if (method == "GET") {
      options.params = data;
    } else {
      options.data = data;
    }

    client.request(options).then((response) => {
      resolve(response.data);
    }).catch((err) => {
        reject(err);
    });
  });
}
