const mongoose = require('mongoose');
const { DATABASE } = require('../../../../Config');
const logger = require('../../../../Config/Logger');

mongoose.Promise = global.Promise;

const options = {
    useNewUrlParser: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useCreateIndex: true
};

mongoose.set('useCreateIndex', true);
mongoose
    .connect(
        `${DATABASE.MONGODB_CONN_URL}`,
        options
    )
    .then(() => logger.info('Mongoose Connection Successful'))
    .catch((err) => {
        logger.error({
            message: {
                title: 'mongoose connection failed.',
                err
            }
        });
    });

module.exports = mongoose;
