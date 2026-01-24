const RateLimiter = require('../../Services/RateLimiter/RateLimiter');
const logger = require('../../../Config/Logger');

class RateLimiterFactory {
    constructor(userId, campaignId, delayInMins, emailId, serviceType) {
        this.userId = userId;
        this.campaignId = campaignId;
        this.delayInMins = delayInMins;
        this.emailId = emailId;
        this.serviceType = serviceType;
    }

    setUserId(userId, campaignId, emailId, serviceType) {
        this.userId = String(userId);
        this.campaignId = campaignId;
        this.emailId = emailId;
        this.serviceType = serviceType;
        return this;
    }

    setDelayInMins(delayInMins) {
        this.delayInMins = delayInMins;
        return this;
    }

    async hit() {
        const key = this.getKeyForCache();
        try {
            await RateLimiter.hit(
                key,
                this.delayInMins
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in hit',
                    key,
                    method: 'hit',
                    class: 'RateLimiterFactory',
                    err
                }
            });
        }
    }

    tooManyAttempts() {
        const key = this.getKeyForCache();
        try {
            return RateLimiter.tooManyAttempts(
                key,
                1
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in tooManyAttempts',
                    key,
                    method: 'tooManyAttempts',
                    class: 'RateLimiterFactory',
                    err
                }
            });
        }
        return null;
    }

    count() {
        const key = this.getKeyForCache();
        try {
            return RateLimiter.attempts(key);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in count',
                    key,
                    method: 'count',
                    class: 'RateLimiterFactory',
                    err
                }
            });
        }
        return null;
    }

    create(userId, campaignId, delayInMins, emailId, serviceType) {
        try {
            this.setDelayInMins(delayInMins);
            return new RateLimiterFactory(userId, campaignId, delayInMins, emailId, serviceType);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in create',
                    userId,
                    campaignId,
                    delayInMins,
                    emailId,
                    serviceType,
                    method: 'create',
                    class: 'RateLimiterFactory',
                    err
                }
            });
        }
        return null;
    }

    getKeyForCache() {
        return `${this.userId} | ${this.campaignId} | ${this.emailId} | ${this.serviceType}`;
    }
}

module.exports = new RateLimiterFactory();
