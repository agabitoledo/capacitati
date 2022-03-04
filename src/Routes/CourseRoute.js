const CourseController = require('../Controllers/CourseController');
const upload = require('../../config/commom');
const fs = require('fs');
const multer = require('multer');

module.exports = (app) => {
  //rota para teste de stream
  app.get('', (req, res) => {
    fs.readFile('./tests/index.html', (error, html) => res.end(html));
  })
  app.post('/course', CourseController.createCourse);
  app.put('/course/:id', CourseController.updateCourse);
  app.delete('/course/:id', CourseController.deleteCourse);
  app.get('/course', CourseController.getCourseList);
  app.get('/course/:id', CourseController.getCourseById);

  app.post('/course/upload/:id', upload.single('video'), CourseController.videoPathUpload); 
  app.get('/course/video/:id',CourseController.getVideo); 
};