const CourseController = require('../Controllers/CourseController');
const upload = require('../../config/commom');
const fs = require('fs');

module.exports = (app) => {
  //rota para teste de stream
  app.get('', (req, res) => {
    fs.readFile('./tests/index.html', (error, html) => res.end(html));
  })
  app.post('/course', CourseController.createCourse);
  app.post('/course/video', CourseController.createVideoClass);
  app.put('/course/:id', CourseController.updateCourse);
  app.delete('/course/:id', CourseController.deleteCourse);
  app.get('/course', CourseController.getCourseList);
  app.get('/course/:id', CourseController.getCourseById);
  app.get('course/list/:courseId', CourseController.getListClass);//Rever
  app.get('/course/video/:courseId/:classNumber', CourseController.getCLass);
  app.post('/course/upload/:courseId/:classNumber', upload.single('videoPath'), CourseController.videoPathUpload);
  app.get('/course/:courseId/:classNumber',CourseController.getVideo);
  app.get('/course/progress/:courseId/:userId', CourseController.checkProgress);
  app.post('/course/progress/:courseId/:userId', CourseController.updateProgress);
};