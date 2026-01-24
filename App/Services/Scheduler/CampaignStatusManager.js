const logger = require('../../../Config/Logger');
const CampaignItem = require('../../Infrastructure/MongoRepository/DbHandlers/CampaignItem');
const Campaign = require('../../Infrastructure/MongoRepository/DbHandlers/Campaign');
const MailItemStore = require('../../Infrastructure/RedisRepository/RedisStore/MailItemStore');

class CampaignStatusManager {
    static async pauseCampaign(campaignId) {
        try {
            const campaign = await Campaign.getCampaignByCampaignId(campaignId);
            const userId = String(campaign.user_id);
            await MailItemStore.removeFromStore(userId, campaignId);
            logger.info({
                message: {
                    title: `campaign ID: ${campaignId} and User ID: ${userId} removed from redis store.`,
                    campaignId,
                    userId,
                    method: 'pauseCampaign',
                    class: 'CampaignStatusManager',
                }
            });
            logger.info({
                message: {
                    title: `campaign ID: ${campaignId} marked as paused.`,
                    campaignId,
                    method: 'pauseCampaign',
                    class: 'CampaignStatusManager',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in pauseCampaign.',
                    campaignId,
                    method: 'pauseCampaign',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async deleteCampaign(campaignId, userId) {
        try {
            await MailItemStore.removeFromStore(userId, campaignId);
            logger.info({
                message: {
                    title: `campaign ID: ${campaignId} and User ID: ${userId} removed from redis store.`,
                    campaignId,
                    userId,
                    method: 'deleteCampaign',
                    class: 'CampaignStatusManager',
                }
            });
            logger.info({
                message: {
                    title: `campaign ID: ${campaignId} deleted.`,
                    campaignId,
                    method: 'deleteCampaign',
                    class: 'CampaignStatusManager',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in deleteCampaign.',
                    campaignId,
                    method: 'deleteCampaign',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async markCampaignAsCompleted(campaignId) {
        try {
            await Campaign.updateCampaignStatus(campaignId, 'completed');
            logger.info({
                message: {
                    title: `campaign ID: ${campaignId} marked as completed.`,
                    campaignId,
                    method: 'markCampaignAsCompleted',
                    class: 'CampaignStatusManager',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in markCampaignAsCompleted.',
                    campaignId,
                    method: 'markCampaignAsCompleted',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async markCampaignAsRunning(campaignId) {
        try {
            await Campaign.updateCampaignStatus(campaignId, 'running');
            logger.info({
                message: {
                    title: `campaign ID: ${campaignId} marked as running.`,
                    campaignId,
                    method: 'markCampaignAsRunning',
                    class: 'CampaignStatusManager',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in markCampaignAsRunning.',
                    campaignId,
                    method: 'markCampaignAsRunning',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async markCampaignAsAwaited(campaignId) {
        try {
            await Campaign.updateCampaignStatus(campaignId, 'awaited');
            logger.info({
                message: {
                    title: `campaign item ID: ${campaignId} marked as awaited.`,
                    campaignId,
                    method: 'markCampaignAsAwaited',
                    class: 'CampaignStatusManager',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in markCampaignAsAwaited.',
                    campaignId,
                    method: 'markCampaignAsAwaited',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async markCampaignItemAsRunning(campaignItemId) {
        try {
            await CampaignItem.updateCampaignItemStatus(campaignItemId, 'running');
            logger.info({
                message: {
                    title: `campaign item ID: ${campaignItemId} marked as running.`,
                    campaignItemId,
                    method: 'markCampaignItemAsRunning',
                    class: 'CampaignStatusManager',
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in markCampaignItemAsRunning.',
                    campaignItemId,
                    method: 'markCampaignItemAsRunning',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async markCampaignItemsAsCompleted(campaignItemIds) {
        try {
            for (const campaignItemId of campaignItemIds) {
                await CampaignItem.updateCampaignItemStatus(
                    campaignItemId,
                    'completed'
                );
                logger.info({
                    message: {
                        title: `campaign item ID: ${campaignItemId} marked as completed.`,
                        campaignItemId,
                        method: 'markCampaignItemsAsCompleted',
                        class: 'CampaignStatusManager',
                    }
                });
            }
            return true;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in markCampaignItemsAsCompleted.',
                    campaignItemIds,
                    method: 'markCampaignItemsAsCompleted',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
        return false;
    }

    static async setChildItemToAwaited(campaignItemIds) {
        try {
            for (const campaignItemId of campaignItemIds) {
                const campaignItem = await CampaignItem.getCampaignSingleItem(
                    campaignItemId
                );
                if (campaignItem.hasChild) {
                    const childItems = await CampaignItem.getChildItems(
                        campaignItemId
                    );
                    for (const childItem of childItems) {
                        const delay = childItem.delay ? childItem.delay : 0;
                        const completionTime = new Date();
                        completionTime.setMinutes(completionTime.getMinutes() + delay);
                        await CampaignItem.markCampaignItemAsAwaited(
                            childItem._id,
                            'awaited',
                            completionTime
                        );
                        logger.info({
                            message: {
                                title: `child item ID: ${childItem._id} marked as awaited.`,
                                childItemId: childItem._id,
                                completionTime,
                                delay,
                                method: 'setChildItemToAwaited',
                                class: 'CampaignStatusManager',
                            }
                        });
                    }
                }
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in setChildItemToAwaited.',
                    campaignItemIds,
                    method: 'setChildItemToAwaited',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async removeCampaignsFromStore(userId) {
        try {
            const campaigns = await Campaign.getCampaignByUserId(userId);
            for (const campaign of campaigns) {
                // eslint-disable-next-line no-await-in-loop
                await MailItemStore.removeFromStore(userId, campaign._id);
                logger.info({
                    message: {
                        title: `campaign ID: ${campaign._id} marked as awaited.`,
                        campaignId: campaign._id,
                        userId,
                        method: 'removeCampaignsFromStore',
                        class: 'CampaignStatusManager',
                    }
                });
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in removeCampaignsFromStore.',
                    userId,
                    method: 'removeCampaignsFromStore',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }

    static async completedCampaignsAndCampaignItems(campaignItemIds) {
        try {
            const campaignItemsGroupBy = {};
            for (const campaignItemId of campaignItemIds) {
                // eslint-disable-next-line no-await-in-loop
                await CampaignItem.updateCampaignItemStatus(
                    campaignItemId,
                    'completed'
                );
                logger.info({
                    message: {
                        title: `campaign item ID: ${campaignItemId} marked as completed.`,
                        campaignItemId,
                        method: 'completedCampaignsAndCampaignItems',
                        class: 'CampaignStatusManager',
                    }
                });
            }
            const completedCampaignItems = await CampaignItem.getAllCampaignItemsOfGivenCampaign(
                campaignItemIds
            );
            completedCampaignItems.forEach((campaignItem) => {
                campaignItemsGroupBy[campaignItem.campaign_id] = [];
            });
            completedCampaignItems.forEach((campaignItem) => {
                campaignItemsGroupBy[campaignItem.campaign_id].push(campaignItem);
            });
            campaignItemsGroupBy.map(async (campaignItem, campaignId) => {
                let markThisCampaignCompleted = true;
                if (campaignItem.status !== 'completed') {
                    markThisCampaignCompleted = false;
                }
                if (markThisCampaignCompleted) {
                    await Campaign.updateCampaignStatus(campaignId, 'completed');
                    logger.info({
                        message: {
                            title: `campaign ID: ${campaignId} marked as completed.`,
                            campaignId,
                            method: 'completedCampaignsAndCampaignItems',
                            class: 'CampaignStatusManager',
                        }
                    });
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in completedCampaignsAndCampaignItems.',
                    campaignItemIds,
                    method: 'completedCampaignsAndCampaignItems',
                    class: 'CampaignStatusManager',
                    err
                }
            });
        }
    }
}

module.exports = CampaignStatusManager;
