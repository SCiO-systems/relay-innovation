const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `.env`)
});

module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'dev',
    HOST : process.env.HOST || 'localhost',
    PORT : process.env.PORT || 5000,
    HTTPS : process.env.HTTPS || false,
    APP : process.env.APP || "NO APP"
}
