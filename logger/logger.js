const winston = require('winston');
const config = require('../config.js');

const addAppNameFormat = winston.format(info => {
    info.appName = "My Program";
    return info;
});



const configuration = {
    level: config.NODE_ENV === 'development' ? 'debug' : 'info',
    transports: [
        new winston.transports.Console({
            level: 'info',
        }),
        new winston.transports.File({
            level: 'error',
            filename: 'logs/server.log'
        })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
            format: 'MMM-DD-YYYY HH:mm:ss'
        }),
        winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
    )
}


const logger = winston.createLogger(configuration);

module.exports = logger;