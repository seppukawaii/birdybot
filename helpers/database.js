const {
  Datastore
} = require('@google-cloud/datastore');

const datastore = new Datastore({
  namespace: 'squawkoverflow'
});

function Database() {}

Database.prototype.KEY = datastore.KEY;

Database.prototype.key = function(kind, id = null) {
  return id ? datastore.key([kind, id]) : datastore.key([kind]);
}

Database.prototype.get = function(kind, id) {
  return new Promise((resolve, reject) => {
    datastore.get(this.key(kind, id)).then(([result]) => {
      return resolve(addResultID(result));
    });
  });
}

Database.prototype.set = function(kind, id, data) {
  return new Promise((resolve, reject) => {
    this.get(kind, id).then((entity) => {

      for (var datum in data) {
        if (data[datum]) {
          entity[datum] = data[datum];
        } else {
          delete entity[datum];
        }
      }

      delete entity._id;

      datastore.save({
        key: entity[Datastore.KEY],
        data: entity
      }).then(() => {
        return resolve(entity);
      });
    });
  });
}

Database.prototype.create = function(kind, data, uniqueField = false) {
  return new Promise((resolve, reject) => {
    if (uniqueField) {
      this.fetch({
        "kind": kind,
        "filters": [
          [uniqueField, "=", data[uniqueField]]
        ]
      }).then((results) => {
        if (results.length > 0) {
          reject(results);
        } else {
          resolve(this.create(kind, data));
        }
      });
    } else {
      resolve(this.save(kind, null, data));
    }
  });
}

Database.prototype.save = function(kind, id, data) {
  return new Promise((resolve, reject) => {
    var key = this.key(kind, id);
    delete data._id;

    datastore.save({
      key: key,
      data: data
    }).then(() => {
      return resolve(key.id);
    });
  });
}

Database.prototype.delete = function(kind, id) {

  return new Promise((resolve, reject) => {
    datastore.delete(this.key(kind, id)).then(() => {
      return resolve();
    });
  });
}

Database.prototype.fetch = function({
  kind,
  filters,
  order,
  limit,
  keysOnly
}) {
  return new Promise((resolve, reject) => {
    let query = datastore.createQuery(kind);

    if (filters) {
      for (filter of filters) {
        query.filter(...filter);
      }
    }

    if (order) {
      query.order(...order);
    }

    if (limit) {
      query.limit(limit);
    }

    if (keysOnly) {
      query.select('__key__');
    }

    datastore.runQuery(query).then(([results]) => {
      return resolve(results.map(addResultID));
    });
  });
}

Database.prototype.fetchOne = function(args) {
  return new Promise((resolve, reject) => {
    this.fetch({
      ...args,
      "limit": 1
    }).then((results) => {
      resolve(results[0]);
    });

  });
}

function addResultID(result) {
  if (result) {
    result._id = result[Datastore.KEY].id || result[Datastore.KEY].name;
  }

  return result;
}

module.exports = new Database();
