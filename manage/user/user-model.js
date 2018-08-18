var util = require('util'),
    logger = require('../../utils/logger'),
    db = require('../../utils/db'),
    constants = require('../../utils/constants'),
    moment = require('moment'),
    encryption = require('../../utils/encryption');

var passport = () => {};
/**
 * 
 * @param {*} Email 
 */
let findOne = (Email) => {
    return new Promise((resolve, reject) => {
        var key = constants.keys.user + encryption.getEmailHash(Email.toLowerCase());
        db.getDocument(key).then((userDoc) => {
            if (userDoc.IsDeleted === true) {
                var error = new Error('User Is Deleted');
                reject(error);
            } else {
                resolve(userDoc);
            }
        }, (error) => {
            reject(error);
        });
    });
};

passport.createNewUser = (reqData) => {
    return new Promise((resolve, reject) => {
        findOne(reqData.Email).then((userDoc) => {
            userDoc.userStatusCode = constants.userStatusKeys.code_4006;
            resolve(userDoc);
        }, (error) => {
            reqData.Email = reqData.Email.toLowerCase();
            reqData.CreatedDate = moment().format();
            reqData.IsDeleted = false;
            reqData.EmaillSalt = encryption.getEmailHash(reqData.Email.toLowerCase());
            var value = encryption.getEncryptedPasswordWithSalt(reqData.Password);
            delete reqData.Password;
            reqData.Password = value.password;
            reqData.Encrypted = value.password;
            reqData.Salt = value.salt;
            reqData.GlobalTime = moment().utc().format();
            var key = constants.keys.user + reqData.EmaillSalt;
            reqData.userStatusCode = constants.userStatusKeys.code_4009;
            db.addDocument(key, reqData).then((status) => {
                logger.info(util.format(`User Created Successfully With Key :- ${key}`));
                resolve(reqData);
            }, (error) => {
                logger.error(util.format(`Error Whle Creating User`));
                reject(error);
            });
        });
    });
};
module.exports = passport;