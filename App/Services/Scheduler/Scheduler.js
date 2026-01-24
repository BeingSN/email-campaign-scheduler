const logger = require('../../../Config/Logger');
const MailItemStore = require('../../Infrastructure/RedisRepository/RedisStore/MailItemStore');
const SendBatchService = require('./SendBatchService');
const MailBatchHelper = require('../../Helpers/MailBatchHelper');

class Scheduler {
    static async process() {
        try {
            const mailItemGroups = await MailItemStore.getAllKeys();
            for (const mailItemGroupKey of mailItemGroups) {
                const [mailSet, userId, campaignId] = mailItemGroupKey.split('|');
                const sendBatchService = await SendBatchService.create(userId);
                const mailItems = await MailItemStore.getKeyItems(mailItemGroupKey);
                let batches = null;
                batches = await MailBatchHelper.getMailsBatch(
                    userId,
                    mailItems,
                    campaignId
                );
                if (batches.length > 0) {
                    await sendBatchService.sendBatches(batches, campaignId);
                }
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in process',
                    method: 'process',
                    class: 'Scheduler',
                    err
                }
            });
        }
    }
}

module.exports = Scheduler;
