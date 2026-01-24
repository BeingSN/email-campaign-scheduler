const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const BlockerService = require('../../../App/Services/RateLimiter/BlockerService');

const userId = '000000000000000000000023';
const emailId = 'test@example.com';
const serviceType = 'gauth';


const userId2 = '000000000000000000000024';

describe('BlockerService Service Test', () => {
    it('should block', async () => {
        const shouldBlock = await BlockerService.shouldBlock(userId);
        console.log(shouldBlock);
    });
    it('should return blockcriteria', async () => {
        const blockCriteria = await BlockerService.getBlockCriteriaForUser(userId);
        console.log('blockCriteria: ', blockCriteria);
    });

    it.only('should check if not within suitable hours', async () => {
        const blockCriteria = await BlockerService.getBlockCriteriaForUser(userId);
        console.log(blockCriteria)
        const ifnotwithinsuitablehours = await BlockerService.checkIfNotWithinSuitableHours(blockCriteria);
        console.log(ifnotwithinsuitablehours);
    });

    it('should check if not daily limit reached', async () => {
        const blockCriteria = await BlockerService.getBlockCriteriaForUser(userId);
        const ifnotdailylimitreached = await BlockerService.checkIfDailyLimitNotReached(blockCriteria);
        console.log(ifnotdailylimitreached);
    });
});
