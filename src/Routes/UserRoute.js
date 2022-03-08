const UserController = require('../Controllers/UserController');

module.exports = (app) => {
    app.post('/user/login', UserController.login);
    app.post('/user', UserController.createUser); 
    app.put('/user/:id', UserController.updateUser);
    app.delete('/user/:id', UserController.deleteUser); //falta implementar a lógica
    app.get('/user', UserController.getUserList);
    app.get('/user/:id', UserController.getUserById);
    app.post('/user/:email', UserController.sendPasswordResetEmail);
    app.post('/user/reset/:id/:token', UserController.receiveNewPassword);
}