const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const RateLimitingConfig = require('../../App/Infrastructure/MongoRepository/DbHandlers/RateLimitingConfig');

const userId = '000000000000000000000018';
const emailId = 'test@example.com';
const serviceType = 'gauth';

describe('RateLimitingConfig DbHandler Test', () => {
    it('should return sending Calendar', async () => {
        // eslint-disable-next-line max-len
        const sendingCalendar = await RateLimitingConfig.getSendingCalendar(userId, emailId, serviceType);
        console.log('Sending Calender: ', sendingCalendar);
    });
    it('should return object config for user', async () => {
        const configForUser = await RateLimitingConfig.getConfigForUser(userId, emailId, serviceType);
        console.log('Config For User: ', configForUser);
    });
});
