const multer = require("multer");
const dirname = require("../../dirname");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirname + '/upload/')
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
