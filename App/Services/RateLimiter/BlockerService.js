const moment = require('moment');
const TimeZoneCriteria = require('../../Services/Scheduler/TimeZoneService');
const BlockCriteria = require('./BlockCriteria');
const DailyCountManager = require('../RateLimiter/DailyCountManager');
const RateLimitingConfig = require('../../Infrastructure/MongoRepository/DbHandlers/RateLimitingConfig');
const logger = require('../../../Config/Logger');

class BlockerService {
    static async shouldBlock(userId, emailId = null, serviceType = null) {
        let shouldBlock = true;
        try {
            const blockCriteria = await this.getBlockCriteriaForUser(
                userId,
                emailId,
                serviceType
            );
            const hasNotDailyLimitReached = await BlockerService.checkIfDailyLimitNotReached(
                blockCriteria
            );
            const isNotInBlockDays = BlockerService.checkIfNotInBlockDays(
                blockCriteria
            );
            const ifNotWithinSuitableHours = BlockerService.checkIfNotWithinSuitableHours(
                blockCriteria
            );
            if (
                hasNotDailyLimitReached
				&& isNotInBlockDays
				&& ifNotWithinSuitableHours
            ) {
                shouldBlock = false;
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in shouldBlock',
                    userId,
                    emailId,
                    serviceType,
                    method: 'shouldBlock',
                    class: 'BlockerService',
                    err
                }
            });
        }

        return shouldBlock;
    }

    static async getBlockCriteriaForUser(
        userId,
        emailId = null,
        serviceType = null
    ) {
        try {
            const rateLimitingConfig = await RateLimitingConfig.getConfigForUser(
                userId,
                emailId,
                serviceType
            );
            return BlockCriteria.createFromConfig(
                userId,
                rateLimitingConfig,
                emailId,
                serviceType
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in getBlockCriteriaForUser',
                    userId,
                    emailId,
                    serviceType,
                    method: 'getBlockCriteriaForUser',
                    class: 'BlockerService',
                    err
                }
            });
        }
        return null;
    }

    static checkIfNotWithinSuitableHours(blockCriteria) {
        let ifNotWithinSuitableHours = false;
        try {
            const allowedRange = blockCriteria.getAllowedRange();
            ifNotWithinSuitableHours = TimeZoneCriteria.isStartAndEndTimeValid(allowedRange);
        } catch (err) {
            console.log(err);
            logger.error({
                message: {
                    title: 'error occurred in checkIfNotWithinSuitableHours',
                    blockCriteria,
                    method: 'checkIfNotWithinSuitableHours',
                    class: 'BlockerService',
                    err
                }
            });
        }

        return ifNotWithinSuitableHours;
    }

    static async checkIfDailyLimitNotReached(blockCriteria) {
        let hasNotDailyLimitReached = false;
        try {
            const userId = blockCriteria.getUserId();
            const emailId = blockCriteria.getEmailId();
            const serviceType = blockCriteria.getServiceType();
            const dailyCountManager = DailyCountManager.create(
                userId,
                emailId,
                serviceType
            );
            const dailyCount = await dailyCountManager.getCount();
            const dailyLimit = blockCriteria.getDailyLimit();

            if (dailyCount < dailyLimit) {
                hasNotDailyLimitReached = true;
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in checkIfDailyLimitNotReached',
                    blockCriteria,
                    method: 'checkIfDailyLimitNotReached',
                    class: 'BlockerService',
                    err
                }
            });
        }
        return hasNotDailyLimitReached;
    }

    static checkIfNotInBlockDays(blockCriteria) {
        let ifNotInBlockDays = false;
        try {
            const currentDay = new Date().getDay();
            const blockDays = blockCriteria.getBlockDays();
            if (!blockDays.includes(currentDay)) {
                ifNotInBlockDays = true;
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in checkIfNotInBlockDays',
                    blockCriteria,
                    method: 'checkIfNotInBlockDays',
                    class: 'BlockerService',
                    err
                }
            });
        }
        return ifNotInBlockDays;
    }
}

module.exports = BlockerService;
