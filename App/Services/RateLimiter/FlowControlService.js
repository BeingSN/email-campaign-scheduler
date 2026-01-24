const FlowCriteria = require('./FlowCriteria');
const RateLimiterFactory = require('../../Infrastructure/RateLimiter/RateLimiterFactory');
const RateLimitingConfig = require('../../Infrastructure/MongoRepository/DbHandlers/RateLimitingConfig');
const logger = require('../../../Config/Logger');

class FlowControlService {
    static async getFlowCriteriaForUser(
        userId,
        campaignId = null,
        emailId = null,
        serviceType = null
    ) {
        try {
            const config = await RateLimitingConfig.getConfigForUser(
                userId,
                emailId,
                serviceType
            );
            return FlowCriteria.createFromConfig(
                userId,
                campaignId,
                config,
                emailId,
                serviceType
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in getFlowCriteriaForUser',
                    userId,
                    campaignId,
                    emailId,
                    serviceType,
                    method: 'getFlowCriteriaForUser',
                    class: 'FlowControlService',
                    err
                }
            });
        }
        return {};
    }

    static async getRateLimiterForUser(
        userId,
        campaignId = null,
        emailId = null,
        serviceType = null
    ) {
        try {
            const flowCriteria = await FlowControlService.getFlowCriteriaForUser(
                userId,
                campaignId,
                emailId,
                serviceType
            );
            const getDelayInMins = flowCriteria.getDelayInMins();
            return RateLimiterFactory.create(
                userId,
                campaignId,
                getDelayInMins,
                emailId,
                serviceType
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in getRateLimiterForUser',
                    userId,
                    campaignId,
                    emailId,
                    serviceType,
                    method: 'getRateLimiterForUser',
                    class: 'FlowControlService',
                    err
                }
            });
        }
        return {};
    }

    static async limitReached(
        userId,
        campaignId,
        emailId = null,
        serviceType = null
    ) {
        try {
            const rateLimiter = await FlowControlService.getRateLimiterForUser(
                userId,
                campaignId,
                emailId,
                serviceType
            );
            const hasLimitedReached = await rateLimiter.tooManyAttempts();
            if (!hasLimitedReached) {
                return hasLimitedReached;
            }
            return !hasLimitedReached;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in limitReached',
                    userId,
                    campaignId,
                    emailId,
                    serviceType,
                    method: 'limitReached',
                    class: 'FlowControlService',
                    err
                }
            });
        }
        return false;
    }
}

module.exports = FlowControlService;
