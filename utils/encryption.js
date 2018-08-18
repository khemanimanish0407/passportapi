var util = require('util');
var config = require('../config');
var bcrypt = require('bcrypt');

var getEmailHash = (email) => {
    var exp = new RegExp('/', 'g');
    var emailHashWithSalt = bcrypt.hashSync(email, config.get('server.security.emailSalt'));
    var emailHash = emailHashWithSalt.substring(29).replace(exp, '');
    return emailHash;
}

// Get password hash with salt
var getEncryptedPasswordWithSalt = (password) => {
    var salt = bcrypt.genSaltSync(10);
    var passwordHashWithSalt = bcrypt.hashSync(password, salt);
    var passwordHash = passwordHashWithSalt.substring(29);
    return {
        password: passwordHash,
        salt: salt
    };
};

module.exports = {
    getEmailHash: getEmailHash,
    getEncryptedPasswordWithSalt: getEncryptedPasswordWithSalt


}