const multer = require('multer');
const fs = require('fs');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const dir = ('./uploads/videos');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const fileStorageEngine = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalName}`)
        }
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {cb(null, `${Date.now()}-${file.originalname}`);},
    })
}

const upload = multer({ storage: fileStorageEngine[process.env.STORAGE_TYPE] });

module.exports = upload;
