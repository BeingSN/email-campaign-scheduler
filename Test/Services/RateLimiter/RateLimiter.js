const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const RateLimiter = require('../../../App/Services/RateLimiter/RateLimiter');
const RateLimiterFactory = require('../../../App/Infrastructure/RateLimiter/RateLimiterFactory');
const userId = '';
const key = 'key';
const maxAttempts = 10;
describe('BlockCriteria Service Test', () => {
    it('should return boolean on tooManyAttempts', async () => {
        const hasCrossedTooManyAttempts = await RateLimiter.tooManyAttempts(key, maxAttempts);
        console.log(hasCrossedTooManyAttempts);
    });
    it('should return total attempts', async () => {
        const totalAttempts = await RateLimiter.attempts(key);
        console.log(totalAttempts);
    });
    it('should return number on hits', async () => {
        const totalAttempts = await RateLimiter.hit(key);
        console.log(totalAttempts);
    });

    it('should return attempts after reset', async () => {
        const deleted = await RateLimiter.resetAttempts(key);
        console.log(deleted);
    });

    it('should return retries left', async () => {
        const left = await RateLimiter.retriesLeft(key, maxAttempts);
        console.log(left);
    });

    it('should return clear the key', async () => {
        const cleared = await RateLimiter.clear(key);
        console.log(cleared);
    });

    it('should check if available in', async () => {
        const seconds = await RateLimiter.availableIn(key);
        console.log(seconds);
    });
});
