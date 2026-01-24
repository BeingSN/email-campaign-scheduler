const amqp = require('amqplib');
const { RABBITMQ } = require('../../../../Config');
const logger = require('../../../../Config/Logger');

const _CHANNEL = {};
let _CONNECTION = null;


class RabbitMQConnection {
    /**
     *
     * @param {Channel} channel
     * @param {String} exchangeName
     * @param {String} exchangeType
     * @returns {Promise<void>}
     */
    static async assertExchange(channel, exchangeName, exchangeType) {
        try {
            await channel.checkExchange(exchangeName);
        } catch (err) {
            await channel.assertExchange(exchangeName, exchangeType);
            logger.error({
                message: {
                    title: 'error occured in assertExchange',
                    channel,
                    exchangeName,
                    exchangeType,
                    method: 'assertExchange',
                    class: 'RabbitMQConnection'
                }
            });

        }
    }

    static async getConnection() {
        if (_CONNECTION !== null) {
            return _CONNECTION;
        }
        try {
            _CONNECTION = await amqp.connect(RABBITMQ.RABBITMQ_CONN_URL);
            logger.info('RabbitMQ connection successful.');
        } catch (err) {
            logger.error({
                message: {
                    title: 'RabbitMQ connection failed.',
                    method: 'getConnection',
                    class: 'RabbitMQConnection',
                    err
                }
            });
        }
        return _CONNECTION;
    }

    static async closeConnection() {
        for (const exchangeName in _CHANNEL) {
            try {
                await _CHANNEL[exchangeName].close();
            } catch (err) {
                logger.error({
                    message: {
                        title: 'RabbitMQ channel connection failed to close.',
                        channel: _CHANNEL[exchangeName],
                        exchangeName,
                        method: 'closeConnection',
                        class: 'RabbitMQConnection',
                        err
                    }
                });
            }
        }
        RabbitMQConnection.connection.close();
        logger.info('RabbitMQ is disconnected successfully');
    }

    /**
     *
     * @param connection
     * @param channel
     * @param connectionUser - whether producer or consumer
     * @returns {Promise<void>}
     */
    static async closeRabbitMQConnectionAndChannel(connection, channel, connectionUser) {
        try {
            await channel.close();
            logger.info({
                message: {
                    title: `successful closing RabbitMQ channel:${connectionUser}`,
                    connection,
                    channel,
                    connectionUser,
                    method: 'closeRabbitMQConnectionAndChannel',
                    class: 'RabbitMQConnection',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: `error occured while closing RabbitMQ channel:${connectionUser}`,
                    connection,
                    channel,
                    connectionUser,
                    method: 'closeRabbitMQConnectionAndChannel',
                    class: 'RabbitMQConnection',
                    err
                }
            });
        }
        try {
            await connection.close();
            logger.info({
                message: {
                    title: `successful closing RabbitMQ connection:${connectionUser}`,
                    connection,
                    channel,
                    connectionUser,
                    method: 'closeRabbitMQConnectionAndChannel',
                    class: 'RabbitMQConnection',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: `error occured while closing RabbitMQ Connection:${connectionUser}`,
                    connection,
                    channel,
                    connectionUser,
                    method: 'closeRabbitMQConnectionAndChannel',
                    class: 'RabbitMQConnection',
                    err
                }
            });
        }
        await new Promise((resolve) => setTimeout(resolve));
    }


    /**
     *
     * @param exchangeName
     * @param exchangeType
     * @returns {Promise<Channel>}
     */
    static async getChannel(exchangeName, exchangeType) {
        if (typeof _CHANNEL[exchangeName] !== 'undefined') {
            return _CHANNEL[exchangeName];
        }
        const connection = await this.getConnection();
        const channel = await connection.createChannel();
        await this.assertExchange(channel, exchangeName, exchangeType);
        _CHANNEL[exchangeName] = channel;
        return channel;
    }
}


module.exports = RabbitMQConnection;
