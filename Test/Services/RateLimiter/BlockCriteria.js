const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const BlockerService = require('../../../App/Services/RateLimiter/BlockerService');
const RateLimitingConfig = require('../../../App/Infrastructure/MongoRepository/DbHandlers/RateLimitingConfig');
const BlockCriteria = require('../../../App/Services/RateLimiter/BlockCriteria');

let rateLimitingConfig = null;
let blockCriteria = null;

const userId = '000000000000000000000025';
const emailId = 'test@example.com';
const serviceType = 'gauth';
(async () => {
    rateLimitingConfig = await RateLimitingConfig.getConfigForUser(
        userId,
        emailId,
        serviceType
    );
})();

describe('BlockCriteria Service Test', () => {
    it('should return BlockCriteria', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log('blockCriteriaObj: ', blockCriteriaObj);
    });


    it('should return dailyLimit', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log(blockCriteriaObj.dailyLimit);
    });

    it('should return emailId', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log(blockCriteriaObj.emailId);
    });

    it('should return userId', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log(blockCriteriaObj.userId);
    });

    it('should return serviceType', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log(blockCriteriaObj.blockDays);
    });

    it('should return allowedRange', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log(blockCriteriaObj.allowedRange);
    });

    it('should return blockDays', async () => {
        const blockCriteriaObj = await BlockCriteria.createFromConfig(
            userId,
            rateLimitingConfig,
            emailId,
            serviceType
        );
        console.log(blockCriteriaObj.blockDays);
    });
});
