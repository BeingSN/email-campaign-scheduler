const logger = require('../../../Config/Logger');
const CampaignStatusManager = require('../Scheduler/CampaignStatusManager');
const NotificationService = require('../Notifications/NotificationService');

class CampaignOperations {
    static async handle(message) {
        try {
            const msgContent = JSON.parse(message.content.toString());
            const { event, body } = msgContent;
            switch (event) {
            case 'campaign.start':

                await CampaignStatusManager.markCampaignAsAwaited(body.campaign_id);
                /**
                 * Notify - campaign has started.
                 */
                await NotificationService.notifyCampaignScheduled(body);
                logger.info({
                    message: {
                        title: `campaign ID:${body.campaign_id} has started.`,
                        msgContent,
                        method: 'handle',
                        class: 'CampaignOperations'
                    }
                });
                break;
            case 'campaign.pause':
                await CampaignStatusManager.pauseCampaign(body.campaign_id);
                logger.info({
                    message: {
                        title: `campaign ID:${body.campaign_id} has paused.`,
                        msgContent,
                        method: 'handle',
                        class: 'CampaignOperations'
                    }
                });
                break;
            case 'campaign.delete':
                await CampaignStatusManager.deleteCampaign(
                    body.campaign_id,
                    body.user_id
                );
                logger.info({
                    message: {
                        title: `campaign ID:${body.campaign_id} has deleted.`,
                        msgContent,
                        method: 'handle',
                        class: 'CampaignOperations'
                    }
                });
                break;
            case 'smtp.done':
                await CampaignStatusManager.setChildItemToAwaited(body);
                logger.info({
                    message: {
                        title: 'set childItems to Awaited',
                        msgContent,
                        method: 'handle',
                        class: 'CampaignOperations'
                    }
                });
                break;
            case 'smtp.completed':
                await CampaignStatusManager.completedCampaignsAndCampaignItems(body);
                await NotificationService.notifyCampaignCompleted(body);
                logger.info({
                    message: {
                        title: 'notify campaign completed',
                        msgContent,
                        method: 'handle',
                        class: 'CampaignOperations'
                    }
                });
                break;
            case 'smtp.rescheduled':
                await CampaignStatusManager.removeCampaignsFromStore(body.user_id);
                logger.info({
                    message: {
                        title: 'notify campaign rescheduled',
                        msgContent,
                        method: 'handle',
                        class: 'CampaignOperations'
                    }
                });
                break;
            default:
                logger.error({
                    message: {
                        title: 'unknown message received',
                        message,
                        method: 'handle',
                        class: 'CampaignOperations',
                    }
                });
                break;
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in handle',
                    message,
                    method: 'handle',
                    class: 'CampaignOperations',
                    err
                }
            });
        }
    }
}

module.exports = CampaignOperations;
