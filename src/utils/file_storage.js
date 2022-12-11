const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/upload/')
    },
    filename: (req, file, cb) => {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." +
            fileFormat[fileFormat.length - 1]);
    },
});

module.exports = multer({
    storage: storage
});
