const CampaignItem = require('../../Infrastructure/MongoRepository/DbHandlers/CampaignItem');
const SentMail = require('../../Infrastructure/MongoRepository/DbHandlers/SentMail');
const RecipientService = require('../Scheduler/RecipientService');
const CampaignStatusManager = require('../Scheduler/CampaignStatusManager');
const logger = require('../../../Config/Logger');

class RunningCampaignItemWatcher {
    static async watch() {
        try {
            const campaignItems = await CampaignItem.getAlreadyRunningCampaign();
            const finishedCampaignItems = [];
            for (const campaignItem of campaignItems) {
                let intendedRecipientsList = await RecipientService.getRecipientByCampaignItemId(
                    String(campaignItem._id)
                );
                if (campaignItem.intendedRecipients) {
                    intendedRecipientsList = [];
                    for (const recipientId of campaignItem.intendedRecipients) {
                        intendedRecipientsList.push(String(recipientId));
                    }
                }
                const sentToRecipients = await SentMail.getSentMailRecipientIdsByCampaignItemId(
                    String(campaignItem._id)
                );
                const difference = intendedRecipientsList.filter(
                    (recipientId) => !sentToRecipients.includes(recipientId)
                );
                if (sentToRecipients.length > 0 && difference.length === 0) {
                    finishedCampaignItems.push(campaignItem);
                }
            }
            const finishedCampaignItemIds = finishedCampaignItems.map(
                (finishedCampaignItem) => String(finishedCampaignItem._id)
            );
            if (finishedCampaignItemIds.length > 0) {
                await CampaignStatusManager.setChildItemToAwaited(
                    finishedCampaignItemIds
                );
                await CampaignStatusManager.markCampaignItemsAsCompleted(
                    finishedCampaignItemIds
                );
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in watch',
                    method: 'watch',
                    class: 'RunningCampaignItemWatcher',
                    err
                }
            });
        }
    }
}

module.exports = RunningCampaignItemWatcher;
