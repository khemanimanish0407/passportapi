var constants = require('../../utils/constants');
var logger = require('../../utils/logger');
var userModel = require('./user-model');

var createNewUser = (req, res) => {
    var data = req.body;
    userModel.createNewUser(data).then((results) => {
        if (results.userStatusCode === constants.userStatusKeys.code_4006) {
            return res.status(400).send(results);
        } else {
            return res.status(200).send(results);
        }
    }, (error) => {
        return res.status(500).send({
            code: 5002,
            messageKey: constants.messageKeys.code_5002,
            data: {}
        });
    });
};


module.exports = {
    createNewUser: createNewUser
};