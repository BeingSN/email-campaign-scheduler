const CampaignItem = require('../../Infrastructure/MongoRepository/DbHandlers/CampaignItem');
const Campaign = require('../../Infrastructure/MongoRepository/DbHandlers/Campaign');
const CampaignStatusManager = require('../Scheduler/CampaignStatusManager');
const logger = require('../../../Config/Logger');
const NotificationService = require('../Notifications/NotificationService');

class RunningCampaignWatcher {
    static async watch() {
        try {
            const campaigns = await Campaign.getCampaignsByStatus('running');
            for (const campaign of campaigns) {
                const campaignItems = await CampaignItem.getCampaignsItemDataByCampaignId(
                    String(campaign._id)
                );
                const completedCampaignItems = campaignItems.filter((campaignItem) => {
                    let hasCampaignItemCompleted = false;
                    if (campaignItem.status === 'completed') {
                        hasCampaignItemCompleted = true;
                    }
                    return hasCampaignItemCompleted;
                });

                /** all campaign items completed */
                if (campaignItems.length === completedCampaignItems.length) {
                    await CampaignStatusManager.markCampaignAsCompleted(String(campaign._id));
                    /**  Notification service */
                    await NotificationService.notifyCampaignCompleted({ campaign_id: campaign._id });
                    logger.info({
                        message: {
                            title: 'mark all campaign items completed',
                            campaignId: campaign._id,
                            method: 'watch',
                            class: 'RunningCampaignWatcher'
                        }
                    });
                }
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in watch',
                    method: 'watch',
                    class: 'RunningCampaignWatcher',
                    err
                }
            });
        }
    }
}

module.exports = RunningCampaignWatcher;
