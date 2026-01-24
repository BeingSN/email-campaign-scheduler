const logger = require('../../../Config/Logger');

class FlowCriteria {
    constructor(
        userId,
        method,
        delayInMins,
        minBatchSize,
        maxBatchSize,
        emailId,
        campaignId,
        serviceType
    ) {
        this.userId = userId;
        this.method = method;
        this.delayInMins = delayInMins;
        this.minBatchSize = minBatchSize;
        this.maxBatchSize = maxBatchSize;
        this.emailId = emailId;
        this.campaignId = campaignId;
        this.serviceType = serviceType;
        this.validate();
    }

    getUserId() {
        return this.userId;
    }

    getMethod() {
        return this.method;
    }

    getDelayInMins() {
        return this.delayInMins;
    }

    getMinBatchSize() {
        return this.minBatchSize;
    }

    getMaxBatchSize() {
        return this.maxBatchSize;
    }

    validate() {
        try {
            if (
                this.maxBatchSize <= 0
                || this.minBatchSize >= this.maxBatchSize
                || this.delayInMins < 0
            ) {
                logger.error({
                    message: {
                        title: 'criteria invalid :error occurred in validate',
                        minBatchSize: this.minBatchSize,
                        maxBatchSize: this.maxBatchSize,
                        delayInMins: this.delayInMins,
                        method: 'validate',
                        class: 'FlowCriteria',
                        err
                    }
                });
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in validate',
                    minBatchSize: this.minBatchSize,
                    maxBatchSize: this.maxBatchSize,
                    delayInMins: this.delayInMins,
                    method: 'validate',
                    class: 'FlowCriteria',
                    err
                }
            });
        }
    }

    createFromConfig(
        userId,
        campaignId,
        config,
        emailId,
        serviceType
    ) {
        try {
            const {
                method, delayInMins, minBatchSize,
                maxBatchSize
            } = config.allowedRange;
            return new FlowCriteria(
                userId,
                method,
                delayInMins,
                minBatchSize,
                maxBatchSize,
                emailId,
                campaignId,
                serviceType
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in createFromConfig',
                    userId,
                    campaignId,
                    config,
                    emailId,
                    serviceType,
                    method: 'createFromConfig',
                    class: 'FlowCriteria',
                    err
                }
            });
        }
        return {};
    }
}

module.exports = new FlowCriteria();
