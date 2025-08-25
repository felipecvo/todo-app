const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
    const salt = process.env.BCRYPT_SALT || (await bcrypt.genSalt(10));
    console.log('salt: ', salt);
    return bcrypt.hash(plainPassword, salt);
}

async function comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePasswords,
};
