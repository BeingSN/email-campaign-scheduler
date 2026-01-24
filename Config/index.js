require('dotenv').config();
const env = require('common-env')();

/**
 *
 * This object contains all the details regarding the configuration of the app.
 *
 */

module.exports = {
    amazonSesDetails: {
        accessKeyId: env.getOrElse('AWS_ACCESS_KEY', ''),
        secretAccessKey: env.getOrElse('AWS_SECRET_KEY', ''),
        region: env.getOrElse('MAIL_AWS_REGION', ''),
    },
    mailFrom: env.getOrElse('MAIL_FROM', 'noreply@example.com'),
    DATABASE: {
        MONGODB_CONN_URL: env.getOrElse('MONGODB_CONN_URL', 'mongodb://localhost:27017/email-scheduler')
    },
    REDIS: {
        HOST: env.getOrElse('REDIS_HOST', '127.0.0.1'),
        PORT: env.getOrElse('REDIS_PORT', 6379)
    },
    RABBITMQ: {
        RABBITMQ_CONN_URL: env.getOrElse('RABBITMQ_CONN_URL', 'amqp://guest:guest@localhost:5672'),
        QUEUES: [
            {
                name: 'smtp.q',
                durable: true
            },
            {
                name: 'scheduler.q',
                durable: true
            }
        ]
    },
    LOGGING: {
        NAME: env.getOrElse('LOGGING_NAME', 'email-scheduler'),
        STREAM: env.getOrElse('LOGGING_STREAM', process.stdout),
        LEVEL: env.getOrElse('LOGGING_LEVEL', '1'),
        INFO: env.getOrElse('LOG_INFO', 'info'),
        ERROR: env.getOrElse('LOG_ERROR', 'error'),
        DEBUG: env.getOrElse('LOG_DEBUG', 'debug'),
        API_KEY: env.getOrElse('LOG_API_KEY', '')
    },
    HTTP: {
        PORT: env.getOrElse('PORT', 3000)
    },
    APPLICATION: {
        NAME: env.getOrElse('APPLICATION_NAME', 'email-scheduler')
    }
};
