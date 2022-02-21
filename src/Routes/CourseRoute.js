const CourseController = require('../Controllers/CourseController');
const upload = require('../../config/commom');
const fs = require('fs');

module.exports = (app) => {
  //rota para teste de stream
  app.get('', (req, res) => {
    fs.readFile('./tests/index.html', (error, html) => res.end(html));
  })
  app.post('/course', CourseController.post);
  app.put('/course/:id', CourseController.put);
  app.delete('/course/:id', CourseController.delete);
  app.get('/course', CourseController.get);
  app.get('/course/:id', CourseController.getById);
  app.post('/course/upload/:id', upload.single('video'), CourseController.videoUpload);
  app.get('/course/video/:id',CourseController.getVideo);
};