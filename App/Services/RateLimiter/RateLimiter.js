const cache = require('../../Infrastructure/RedisRepository/Connections');
const logger = require('../../../Config/Logger');

class RateLimiter {
    static async tooManyAttempts(key, maxAttempts) {
        try {
            const currentAttemptCount = await this.attempts(key);
            const isKeyPresent = await cache.exists(`${key}:timer`);
            if (currentAttemptCount >= maxAttempts) {
                if (isKeyPresent) {
                    return true;
                }
                await this.resetAttempts(key);
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in tooManyAttempts',
                    key,
                    maxAttempts,
                    method: 'tooManyAttempts',
                    class: 'RateLimiter'
                }
            });
        }

        return false;
    }

    /**
     * Get the number of attempts for the given key.
     *
     * @param {String} key
     * @returns {Any}
     */
    static async attempts(key) {
        let result = null;
        try {
            result = await cache.get(key);
        } catch (err) {
            if (err) {
                result = 0;
            }
            logger.error({
                message: {
                    title: 'error occured in attempts',
                    key,
                    method: 'attempts',
                    class: 'RateLimiter',
                    err
                }
            });
        }
        return result;
    }

    static async hit(key, decayMinutes = 1) {
        try {
            const decaySeconds = decayMinutes * 60;
            const dte = new Date();
            dte.setSeconds(dte.getSeconds() + decaySeconds);
            const valueToBeStored = dte.getTime();
            await cache.set(`${key}:timer`, valueToBeStored, 'EX', decaySeconds);
            const added = await cache.set(key, 0, 'EX', decaySeconds);
            const hits = await cache.incr(key);
            if (added !== 'OK' && hits === 1) {
                await cache.set(key, 1, 'EX', decaySeconds);
            }
            return hits;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in hit',
                    key,
                    decayMinutes,
                    method: 'hit',
                    class: 'RateLimiter',
                    err
                }
            });
        }
        return -1;
    }

    static async resetAttempts(key) {
        try {
            return cache.del(key);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in resetAttempts',
                    key,
                    method: 'resetAttempts',
                    class: 'RateLimiter',
                    err
                }
            });
        }
        return null;
    }

    static async retriesLeft(key, maxAttempts) {
        try {
            const attempts = await this.attempts(key);
            return (maxAttempts - attempts);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in retriesLeft',
                    key,
                    maxAttempts,
                    method: 'retriesLeft',
                    class: 'RateLimiter',
                    err
                }
            });
        }
        return 0;
    }

    /**
     * Clear the hits and lockout timer for the given key.
     *
     * @param {String} key
     * @returns void
     */
    static async clear(key) {
        try {
            await this.resetAttempts(key);
            await cache.del(`${key}:timer`);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in clear',
                    key,
                    method: 'clear',
                    class: 'RateLimiter',
                    err
                }
            });
        }
    }

    /**
     * Get the number of seconds until the "key" is accessible again.
     *
     * @param {String} key
     * @returns {Number}
     */
    static async availableIn(key) {
        try {
            const getSeconds = await cache.get(`${key}:timer`);
            return getSeconds - (new Date().getSeconds());
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in availableIn',
                    key,
                    method: 'availableIn',
                    class: 'RateLimiter',
                    err
                }
            });
        }
        return 0;
    }
}

module.exports = RateLimiter;
