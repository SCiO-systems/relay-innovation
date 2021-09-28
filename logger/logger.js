const winston = require('winston');
const config = require('../config.js');
require('winston-daily-rotate-file');

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}


// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
    const env = config.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'warn'
}


// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',

}

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors)

const addAppNameFormat = winston.format(info => {
    info.appName = config.APP;
    return info;
});

// Chose the aspect of your log customizing the log format.
const genericFormat = winston.format.combine(
    addAppNameFormat(),
    // Add the message timestamp with the preferred format
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.align(),
    // Define the format of the message showing the timestamp, the level and the message
    winston.format.printf(
        (info) => `${info.timestamp} ${info.appName} ${info.level}: ${info.message}`,
    ),
)


const fileTransport = new (winston.transports.DailyRotateFile)({
    filename: `logs/application-%DATE%.log`,
    datePattern: `YYYY-MM-DD-HH`,
    zippedArchive: true,
    maxSize: `20m`,
    maxFiles: `14d`,
    format:  genericFormat

});


// Define which transports the logger must use to print out messages.
const transports = [
    fileTransport,
    // Allow the use the console to print the messages
    new winston.transports.Console({
        format:  winston.format.combine(winston.format.colorize(), genericFormat)
    }),
]

// Create the logger instance that has to be exported
// and used to log messages.
const Logger = winston.createLogger({
    level: level(),
    levels,
    genericFormat,
    transports
})

module.exports = Logger;