const RabbitMQConnection = require('../../Infrastructure/RabbitMQRepository/Connections');
const { RABBITMQ } = require('../../../Config');
const logger = require('../../../Config/Logger');
const CampaignOperations = require('../IncomingMessage/CampaignOperations');

class Consumer {
    static async process() {
        /**
         * configure consumer
         */
        const exchangeOptions = {
            name: 'scheduler',
            type: 'direct'
        };
        const queueName = 'scheduler.q';
        const [queueConfig] = RABBITMQ.QUEUES.filter(
            (queue) => queue.name === queueName
        );
        const { name, type } = exchangeOptions;
        const channel = await RabbitMQConnection.getChannel(name, type);
        await channel.assertQueue(queueName, queueConfig);
        await channel.bindQueue(queueName, name);
        await channel.prefetch(1);
        /**
         * start consuming message
         */
        channel.consume(queueName, async (msg) => {
            try {
                const message = JSON.parse(msg.content.toString());
                logger.info({
                    message: {
                        title: 'message received from server',
                        message,
                        method: 'process',
                        class: 'Consumer'
                    }
                });
                await CampaignOperations.handle(msg);
                await channel.ack(msg);
            } catch (err) {
                logger.error({
                    message: {
                        title: 'error occured while consuming message',
                        msg,
                        method: 'process',
                        class: 'Consumer',
                        err
                    }
                });
            }
        });
    }
}

module.exports = Consumer;
