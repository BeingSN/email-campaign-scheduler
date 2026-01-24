const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const DailyCountManager = require('../../../App/Services/RateLimiter/DailyCountManager');

const userId = '000000000000000000000022';
const emailId = 'test@example.com';
const serviceType = 'gauth';

describe('DailyCountManager Service Test', () => {
    it('should set user and return updated object', async () => {
        const dailyCountManager = await DailyCountManager.create(userId, emailId, serviceType);
        console.log(dailyCountManager);
    });
    it('should return count', async () => {
        const dailyCountManager = await DailyCountManager.create(userId, emailId, serviceType);
        console.log(dailyCountManager.getCount());
    });

    it('should reset count', async () => {
        const dailyCountManager = await DailyCountManager.create(userId, emailId, serviceType);
        console.log(dailyCountManager.resetCount());
    });

    it('should add to count', async () => {
        const dailyCountManager = await DailyCountManager.create(userId, emailId, serviceType);
        console.log(dailyCountManager.addToCount(10));
    });

    it('should increment', async () => {
        const dailyCountManager = await DailyCountManager.create(userId, emailId, serviceType);
        console.log(dailyCountManager.increment());
    });
});
