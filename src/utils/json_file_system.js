const fileSystem = require('fs');

const save = (path, json, callback) => {
    fileSystem.writeFile(path, JSON.stringify(json), callback);
};

const load = (path, callback) => {
    fileSystem.readFile(path, (err, data) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, JSON.parse(data));
    });
};


module.exports = { save, load };