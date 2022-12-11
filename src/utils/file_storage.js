const multer = require("multer");
const dirname = require("../../dirname");

const path = dirname + '/upload/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '.jpg');
    },
});

module.exports.fileStorage = multer({ storage: storage });
module.exports.fileStoragePath = path;
