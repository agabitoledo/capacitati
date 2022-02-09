const UserController = require('../Controllers/UserController');
module.exports = (app) => {
  app.post('/courses', UserController.post);
  app.put('/courses/:id', UserController.put);
  app.delete('/courses/:id', UserController.delete);
  app.get('/courses', UserController.get);
  app.get('/courses/:id', UserController.getById);
};