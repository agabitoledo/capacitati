const CourseRoute = require('./CourseRoute');
const UserRoute = require('./UserRoute');
module.exports = (app) => {
   UserRoute(app)
   CourseRoute(app)
}