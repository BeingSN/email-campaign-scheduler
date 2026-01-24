const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const FlowControlService = require('../../../App/Services/RateLimiter/FlowControlService');

const userId = '000000000000000000000026';
const emailId = 'test@example.com';
const serviceType = 'gauth';

describe('FlowControlService Service Test', () => {
    it('should return flow criteria', async () => {
        const flowCriteria = await FlowControlService.getFlowCriteriaForUser(userId);
        console.log(flowCriteria);
    });
    it('should return rate limiter', async () => {
        const rateLimiter = await FlowControlService.getRateLimiterForUser(userId);
        console.log(rateLimiter);
    });
    it('should return boolean on limit reached', async () => {
        const limitReached = await FlowControlService.limitReached(userId);
        console.log(limitReached);
    });
});
