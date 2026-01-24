const DailyCount = require('../Redis/DailyCount');
const logger = require('../../../Config/Logger');

class DailyCountManager {
    constructor(userId, emailId = null, serviceType = null) {
        this.userId = userId;
        this.emailId = emailId;
        this.serviceType = serviceType;
    }

    setUser(userId, emailId = null, serviceType = null) {
        this.userId = userId;
        this.emailId = emailId;
        this.serviceType = serviceType;
        return this;
    }

    async getCount() {
        try {
            const { userId, emailId, serviceType } = this;
            return DailyCount.getDailyCountForUser(userId, emailId, serviceType);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in checkIfNotInBlockDays',
                    method: 'getCount',
                    class: 'DailyCountManager',
                    err
                }
            });
        }
        return -1;
    }

    async resetCount() {
        try {
            const { userId, emailId, serviceType } = this;
            await DailyCount.updateDailyCount(userId, 0, emailId, serviceType);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in resetCount',
                    method: 'resetCount',
                    class: 'DailyCountManager',
                    err
                }
            });
        }
    }

    async addToCount(num) {
        try {
            const { userId, emailId, serviceType } = this;
            const count = await DailyCount.getDailyCountForUser(userId, emailId, serviceType);
            await DailyCount.updateDailyCount(userId, count + num, emailId, serviceType);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in addToCount',
                    num,
                    method: 'addToCount',
                    class: 'DailyCountManager',
                    err
                }
            });
        }
    }

    async increment() {
        try {
            const { userId, emailId, serviceType } = this;
            const currentCount = await DailyCount.getDailyCountForUser(userId, emailId, serviceType);
            await DailyCount.updateDailyCount(userId, currentCount + 1, emailId, serviceType);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in increment',
                    method: 'increment',
                    class: 'DailyCountManager',
                    err
                }
            });
        }
    }

    static create(userId, emailId = null, serviceType = null) {
        try {
            return new DailyCountManager(userId, emailId, serviceType);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occurred in create',
                    userId,
                    emailId,
                    serviceType,
                    method: 'create',
                    class: 'DailyCountManager',
                    err
                }
            });
        }
        return {};
    }
}

module.exports = DailyCountManager;
