const multer = require("multer");
const dirname = require("../../dirname");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirname + '/upload/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '.jpg');
    },
});

module.exports = multer({
    storage: storage
});
