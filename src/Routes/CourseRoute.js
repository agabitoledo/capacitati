const CourseController = require('../Controllers/CourseController');
const upload = require('../../config/commom');
const fs = require('fs');

module.exports = (app) => {
  //rota para teste de stream
  app.get('', (req, res) => {
    fs.readFile('./tests/index.html', (error, html) => res.end(html));
  })
  app.post('/course', CourseController.createCourse);
  app.get('/course', CourseController.getCourseList);
  app.post('/course/video', CourseController.createVideoClass);
  app.get('/course/status/:courseId/:userId', CourseController.checkUserStatus);
  app.post('/course/add/:courseId/:userId', CourseController.addUserToCourse); //
  app.post('/course/status/:courseId/:userId', CourseController.setCompleted);
  app.get('/course/list/:courseId', CourseController.getListClass);
  app.get('/course/video/:courseId/:classNumber', CourseController.getCLass);
  app.post('/course/upload/:courseId/:classNumber', upload.single('videoPath'), CourseController.videoPathUpload);
  app.get('/course/progress/:courseId/:userId', CourseController.checkProgress);
  app.post('/course/progress/:courseId/:userId', CourseController.updateProgress);
  app.get('/course/:courseId/:classNumber',CourseController.getVideo);
  app.put('/course/:id', CourseController.updateCourse);
  app.delete('/course/:id', CourseController.deleteCourse);
  app.get('/course/:id', CourseController.getCourseById);
};