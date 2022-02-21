const multer = require('multer');
const fs = require('fs');

const dir = ('./../../videos');

if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, {recursive: true});
} 

//Como será feito o armazenamento
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalName}`)
    }
});

const upload = multer({ storage: fileStorageEngine});
module.exports = upload;