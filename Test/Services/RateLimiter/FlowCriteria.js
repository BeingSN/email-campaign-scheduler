const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const RateLimitingConfig = require('../../../App/Infrastructure/MongoRepository/DbHandlers/RateLimitingConfig');
const FlowControlService = require('../../../App/Services/RateLimiter/FlowControlService');
const FlowCriteria = require('../../../App/Services/RateLimiter/FlowCriteria');

let flowCriteria = null;
let rateLimitingConfig = null;
const userId = '000000000000000000000027';
const emailId = 'test@example.com';
const serviceType = 'gauth';
const campaignId = '000000000000000000000028';
(async () => {
    rateLimitingConfig = await RateLimitingConfig.getConfigForUser(userId, emailId, serviceType);
    flowCriteria = await FlowControlService.getFlowCriteriaForUser(
        userId,
        campaignId,
        emailId,
        serviceType
    );
})();

describe('FlowCriteria Service Test', () => {
    it('should return FlowCriteria', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        console.log(flowCritObj);
    });

    it('should return userId', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        console.log(flowCritObj.getUserId());
    });

    it('should return method', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        console.log(flowCritObj.getMethod());
    });

    it('should return delayInMins', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        console.log(flowCritObj.getDelayInMins());
    });

    it('should return getMinBatchSize', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        console.log(flowCritObj.getMinBatchSize());
    });

    it('should return maxBatchSize', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        console.log(flowCritObj.getMaxBatchSize());
    });

    it('should validate', async () => {
        const flowCritObj = await FlowControlService.getFlowCriteriaForUser(
            userId,
            campaignId,
            emailId,
            serviceType
        );
        flowCritObj.validate();
    });
});
