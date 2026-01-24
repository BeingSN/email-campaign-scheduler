/* eslint-disable no-await-in-loop */
const moment = require('moment');
const Producer = require('../RabbitMQ/Producer');
const logger = require('../../../Config/Logger');
const FlowControlService = require('../RateLimiter/FlowControlService');
const DailyCountManager = require('../RateLimiter/DailyCountManager');
const MailBatchHelper = require('../../Helpers/MailBatchHelper');
const BlockerService = require('../RateLimiter/BlockerService');
const ProcessingEmailService = require('../ProcessingEmail/ProcessingEmailService');
const MailItemStore = require('../../Infrastructure/RedisRepository/RedisStore/MailItemStore');
const redis = require('../../Infrastructure/RedisRepository/Connections/index');
const NotificationService = require('../Notifications/NotificationService');

class SendBatchService {
    constructor(userId) {
        this.userId = userId;
    }

    static create(userId) {
        return new SendBatchService(userId);
    }

    setUserId(userId) {
        this.userId = userId;
    }

    /**
     *
     * @param {Object[][]} batches
     * @param campaignId
     * @returns {Promise<void>}
     */
    async sendBatches(batches, campaignId) {
        try {
            const info = await MailBatchHelper.getEmailIdAndServiceType(
                batches[0]
            );
            const rateLimiter = await FlowControlService.getRateLimiterForUser(
                this.userId,
                campaignId,
                info.emailId,
                info.serviceType
            );
            const dailyCountManager = await DailyCountManager.create(this.userId,
                info.emailId, info.serviceType);
            for (const batch of batches) {
                const limitReached = await FlowControlService.limitReached(
                    this.userId,
                    campaignId,
                    info.emailId,
                    info.serviceType
                );
                if (!limitReached) {
                    for (const mailItem of batch) {
                        const ShouldBlock = await BlockerService.shouldBlock(
                            this.userId,
                            info.emailId,
                            info.serviceType
                        );
                        if (!ShouldBlock) {
                            await ProcessingEmailService.updateInStore(
                                mailItem.campaignItemId
                            );

                            await Producer.process(mailItem);

                            await MailItemStore.removeItemFromSet(
                                this.userId,
                                mailItem.campaignId,
                                mailItem
                            );
                        } else {
                            logger.info({
                                message: {
                                    title: `today daily limit exceeded for user ID: ${this.userId}`,
                                    userId: this.userId,
                                    campaignId,
                                    method: 'sendBatches',
                                    class: 'SendBatchService'
                                }
                            });
                            const key = await redis.get(`mailSend|${this.userId}|${campaignId}|${moment()
                                .format('YYYY-MM-DD')}`);
                            if (key === null) {
                                await redis.del(`mailSend|${this.userId}|${campaignId}|${moment()
                                    .subtract(1, 'days')
                                    .format('YYYY-MM-DD')}`);
                                await redis.set(`mailSend|${this.userId}|${campaignId}|${moment()
                                    .format('YYYY-MM-DD')}`, 1);
                                await NotificationService.notifyCampaignApiLimitExceeded({ campaign_id: campaignId });
                            }
                            logger.error({
                                message: {
                                    title: `today daily limit exceeded for user ID: ${this.userId}`,
                                    campaignId,
                                    userId: this.userId,
                                    method: 'sendBatches',
                                    class: 'SendBatchService'
                                }
                            });
                            // throw new Error(`Today's Daily limit exceeded for user ${this.userId}`);
                        }
                        /** record a hit after each successive sent mail */
                        await dailyCountManager.increment();
                    }
                    /** record success */
                    await rateLimiter.hit();
                } else {
                    logger.info({
                        message: {
                            title: `today batch limit exceeded for user ID: ${this.userId}`,
                            userId: this.userId,
                            campaignId,
                            method: 'sendBatches',
                            class: 'SendBatchService'
                        }
                    });
                    const key = await redis.get(`mailSend|${this.userId}|${campaignId}|${moment()
                        .format('YYYY-mm-dd')}`);
                    if (key === null) {
                        await redis.del(`mailSend|${this.userId}|${campaignId}|${moment()
                            .subtract(1, 'days')
                            .format('YYYY-mm-dd')}`);
                        await redis.set(`mailSend|${this.userId}|${campaignId}|${moment()
                            .format('YYYY-mm-dd')}`, 1);
                        await NotificationService.notifyCampaignApiLimitExceeded({ campaign_id: campaignId });
                        logger.error({
                            message: {
                                title: `today batch limit exceeded for user ID: ${this.userId}`,
                                userId: this.userId,
                                campaignId,
                                method: 'sendBatches',
                                class: 'SendBatchService'
                            }
                        });
                        // throw new Error(`Today's Batch limit exceeded ${this.userId}`);
                    }
                }
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in sendBatches',
                    userId: this.userId,
                    campaignId,
                    batches,
                    method: 'sendBatches',
                    class: 'SendBatchService',
                    err
                }
            });
        }
    }
}

module.exports = SendBatchService;
