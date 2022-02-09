const CoursesRoute = require('./CoursesRoute');
const UserRoute = require('./UserRoute');
module.exports = (app) => {
   UserRoute(app)
   CoursesRoute(app)
}