const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '.jpg');
    },
});

module.exports = multer({
    storage: storage
});
