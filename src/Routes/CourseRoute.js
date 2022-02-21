const CourseController = require('../Controllers/CourseController');
const upload = require('../../config/commom');

module.exports = (app) => {
  app.post('/course', CourseController.post);
  app.put('/course/:id', CourseController.put);
  app.delete('/course/:id', CourseController.delete);
  app.get('/course', CourseController.get);
  app.get('/course/:id', CourseController.getById);
  app.post('/course/upload/:id', upload.single('video'), CourseController.videoUpload);
};