const multer = require("multer");
const dirname = require("../../dirname");

const path = dirname + '/uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '.jpg');
    },
});

module.exports = multer({ storage: storage });
