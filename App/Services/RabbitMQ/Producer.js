const RabbitMQConnection = require('../../Infrastructure/RabbitMQRepository/Connections');
const { RABBITMQ } = require('../../../Config');
const logger = require('../../../Config/Logger');

class Producer {
    static async process(message, key = '') {
        try {
            /**
             * configure producer
             */
            const exchangeOptions = {
                name: 'smtp',
                type: 'direct'
            };

            const queueName = 'smtp.q';
            const [queueConfig] = RABBITMQ.QUEUES.filter(
                (queue) => queue.name === queueName
            );
            const { name, type } = exchangeOptions;
            const channel = await RabbitMQConnection.getChannel(name, type);
            await channel.assertQueue(queueName, queueConfig);
            await channel.bindQueue(queueName, name);
            //publish message
            await channel.publish(name, key, Buffer.from(JSON.stringify(message)), { persistent: true });
            logger.info({
                message: {
                    title: 'producer published message successfully',
                    message,
                    method: 'process',
                    class: 'Producer'
                }
            });

        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in process',
                    message,
                    key,
                    method: 'process',
                    class: 'Producer',
                    err
                }
            });
        }
    }
}

module.exports = Producer;
