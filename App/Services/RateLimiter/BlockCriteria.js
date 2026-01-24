const logger = require('../../../Config/Logger');

class BlockCriteria {
    constructor(
        userId,
        blockDays,
        allowedRange,
        dailyLimit,
        emailId,
        serviceType
    ) {
        this.userId = userId;
        this.blockDays = blockDays;
        this.allowedRange = allowedRange;
        this.dailyLimit = Number(dailyLimit);
        this.emailId = emailId;
        this.serviceType = serviceType;
        if (dailyLimit <= 0) {
            logger.error({
                message: {
                    title: 'daily limit should be a positive value',
                    userId,
                    blockDays,
                    allowedRange,
                    dailyLimit,
                    emailId,
                    serviceType,
                    method: 'constructor',
                    class: 'BlockCriteria',
                }
            });
        }
    }

    /**
     * @returns {Any}
     */
    getUserId() {
        return this.userId;
    }

    /**
     * @returns {Any}
     */
    getEmailId() {
        return this.emailId;
    }

    /**
     * @returns {Any}
     */
    getServiceType() {
        return this.serviceType;
    }

    /**
     * @returns {Number[]}
     */
    getBlockDays() {
        return this.blockDays;
    }

    /**
     * @returns {[]}
     */
    getAllowedRange() {
        return this.allowedRange;
    }

    /**
     * @returns {Number}
     */
    getDailyLimit() {
        return this.dailyLimit;
    }

    static createFromConfig(
        userId,
        rateLimitingConfig,
        emailId,
        serviceType
    ) {
        try {
            const { blockDays, allowedRange } = rateLimitingConfig;
            return new BlockCriteria(
                userId,
                blockDays,
                allowedRange,
                allowedRange.dailyLimit,
                emailId,
                serviceType
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in createFromConfig',
                    userId,
                    rateLimitingConfig,
                    emailId,
                    serviceType,
                    method: 'createFromConfig',
                    class: 'BlockCriteria',
                    err
                }
            });
        }
        return {};
    }
}

module.exports = BlockCriteria;
