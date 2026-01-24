const redis = require('../Connections');
const logger = require('../../../../Config/Logger');

const REDISHASHPREFIX = 'mailSets|';

class MailItemStore {
    static generateKey(userId, campaignId) {
        return `${REDISHASHPREFIX}${userId}|${campaignId}`;
    }

    static serializeData(mailItems) {
        const serializedData = [];
        try {
            for (const mailItem of mailItems) {
                serializedData.push(JSON.stringify(mailItem));
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured while iterating mailItems in serializeData',
                    mailItems,
                    method: 'serializeData',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return serializedData;
    }

    static deserializeData(mailItems) {
        const deSerializedData = [];
        try {
            for (const mailItem of mailItems) {
                deSerializedData.push(JSON.parse(mailItem));
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured while iterating mailItems in deserializeData',
                    mailItems,
                    method: 'deserializeData',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return deSerializedData;
    }

    static async getUserCampaignKeys(userId) {
        try {
            return redis.get(`${REDISHASHPREFIX}${userId}|*`);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getUserCampaignKeys',
                    userId,
                    method: 'getUserCampaignKeys',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return null;
    }

    static async getCampaignRecipientCount(mailItems) {
        try {
            const deSerializedMailItems = MailItemStore.deserializeData(mailItems);
            return deSerializedMailItems.length;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getCampaignRecipientCount',
                    mailItems,
                    method: 'getCampaignRecipientCount',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return null;
    }

    static async addToStore(userId, campaignId, mailItems) {
        try {
            const key = MailItemStore.generateKey(userId, campaignId);
            const serializedMailItems = MailItemStore.serializeData(mailItems);
            await redis.sadd(key, serializedMailItems);
            logger.info({
                message: {
                    title: 'mailItem added to store',
                    key,
                    userId,
                    campaignId,
                    mailItems,
                    method: 'addToStore',
                    class: 'MailItemStore'
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in addToStore',
                    userId,
                    campaignId,
                    mailItems,
                    method: 'addToStore',
                    class: 'MailItemStore',
                    err
                }
            });
        }
    }

    static async removeFromStore(userId, campaignId) {
        try {
            const key = MailItemStore.generateKey(userId, campaignId);
            await redis.del(key);
            logger.info({
                message: {
                    title: 'removed from store',
                    key,
                    userId,
                    campaignId,
                    method: 'removeFromStore',
                    class: 'MailItemStore'
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in removeFromStore',
                    userId,
                    campaignId,
                    method: 'removeFromStore',
                    class: 'MailItemStore',
                    err
                }
            });
        }
    }

    static async removeItemFromSet(userId, campaignId, mailItem) {
        try {
            const key = MailItemStore.generateKey(userId, campaignId);
            await redis.srem(key, JSON.stringify(mailItem));
            logger.info({
                message: {
                    title: 'mailItem of mailItems set, removed from store',
                    key,
                    mailItem,
                    userId,
                    campaignId,
                    method: 'removeItemFromSet',
                    class: 'MailItemStore'
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in removeItemFromSet',
                    userId,
                    campaignId,
                    mailItem,
                    method: 'removeItemFromSet',
                    class: 'MailItemStore',
                    err
                }
            });
        }
    }

    static async getUserItems(userId, campaignId) {
        try {
            const key = MailItemStore.generateKey(userId, campaignId);
            const redisUserItems = await redis.smembers(key);
            return JSON.parse(redisUserItems);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getUserItems',
                    userId,
                    campaignId,
                    method: 'getUserItems',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return [];
    }

    static async getAllKeys() {
        try {
            return redis.keys(`${REDISHASHPREFIX}*`);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getAllKeys',
                    key: `${REDISHASHPREFIX}*`,
                    method: 'getAllKeys',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return null;
    }

    static async getKeyItems(key) {
        try {
            const items = await redis.smembers(key);
            return MailItemStore.deserializeData(items);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getKeyItems',
                    key,
                    method: 'getKeyItems',
                    class: 'MailItemStore',
                    err
                }
            });
        }
        return [];
    }
}

module.exports = MailItemStore;
