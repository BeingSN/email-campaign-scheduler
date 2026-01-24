const Logger = require('logdna');
const { LOGGING, APPLICATION } = require('../Config');

/**
 * This class represent a logger which prints the flow of
 * the app, by showing what each function is doing.
 */

class LoggerDNA {
    /**
     * This method returns an instance of {Logger}
     * @returns an instance of {Logger}
     */
    create() {
        return Logger.createLogger(LOGGING.API_KEY, {
            app: APPLICATION.NAME
        });
    }
}

module.exports = new LoggerDNA().create();
