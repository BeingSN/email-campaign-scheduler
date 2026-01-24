const cache = require('../../Infrastructure/RedisRepository/Connections');
const logger = require('../../../Config/Logger');

const cacheTime = 1450;

class DailyCount {
    static getTodayKeyForUser(userId, emailId, serviceType) {
        return `${new Date().toDateString()}|${userId}|${emailId}|${serviceType}`;
    }

    static async getDailyCountForUser(userId, emailId = null, serviceType = null) {
        let dailyCount = 0;
        try {
            const key = await this.getTodayKeyForUser(userId, emailId, serviceType);
            const doesKeyExist = await cache.exists(key);

            if (doesKeyExist) {
                dailyCount = await cache.get(key);
            } else {
                await cache.set(key, 0, 'EX', cacheTime);
            }
            if (typeof dailyCount === 'string') {
                dailyCount = Number(dailyCount);
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getDailyCountForUser',
                    userId,
                    emailId,
                    serviceType,
                    method: 'getDailyCountForUser',
                    class: 'DailyCount',
                    err
                }
            });
        }

        return dailyCount;
    }

    static async updateDailyCount(userId, count, emailId = null, serviceType = null) {
        try {
            const key = this.getTodayKeyForUser(userId, emailId, serviceType);
            await cache.set(key, count, 'EX', cacheTime);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in updateDailyCount',
                    userId,
                    emailId,
                    serviceType,
                    method: 'updateDailyCount',
                    class: 'DailyCount',
                    err
                }
            });
        }
    }
}

module.exports = DailyCount;
