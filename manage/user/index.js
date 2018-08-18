var service = require('./user-service');
module.exports = (app) => {
    app.post('/passport/user/createNewUser', service.createNewUser);
};