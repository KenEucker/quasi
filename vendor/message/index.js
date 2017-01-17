'use strict';

var /// To output console messages
    chalk = require('chalk');

module.exports = {
    logStatus : logStatus,
    logError : logError,
    logSuccess : logSuccess,
    logUpdate : logUpdate,
    logNotice: logNotice,
    logInfo : logInfo
};

function logStatus(message) {
    logChalkMessage(chalk.yellow, message);
}

function logError(message) {
    logChalkMessage(chalk.red, message);
}

function logSuccess(message) {
    logChalkMessage(chalk.green, message);
}

function logUpdate(message) {
    logChalkMessage(chalk.magenta, message);
}

function logNotice(message) {
    logChalkMessage(chalk.blue, message);
}

function logInfo(message) {
    log(message);
}


function logChalkMessage(styles, message) {
    console.log(styles(message));
}

function log(message) {
    console.log(message);    
}