const Campaign = require('../../Infrastructure/MongoRepository/DbHandlers/Campaign');
const CampaignItem = require('../../Infrastructure/MongoRepository/DbHandlers/CampaignItem');
const ScheduleMailItems = require('../Scheduler/ScheduleMailItems');
const MailItemFactory = require('../../Infrastructure/MailItem/MailItemFactory');
const RecipientService = require('../../Services/Scheduler/RecipientService');
const logger = require('../../../Config/Logger');

class ChildEmailScheduler {
    static async process() {
        try {
            const readyToRunCampaignItems = await CampaignItem.getReadyToRun();
            let overAllMails = [];
            for (const campaignItem of readyToRunCampaignItems) {
                const campaign = await Campaign.getCampaignByCampaignId(campaignItem.campaign_id);

                const recipientLists = await RecipientService.getRecipientByCampaignItemId(campaignItem._id);

                await ChildEmailScheduler.addRecipientsToDatabase(campaignItem, recipientLists);
                const mailItems = await MailItemFactory.generate(
                    campaign,
                    campaignItem,
                    recipientLists
                );
                overAllMails = [...overAllMails, ...mailItems];
            }
            await ScheduleMailItems.scheduleMailInStore(overAllMails, true);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in in process',
                    method: 'process',
                    class: 'ChildEmailScheduler',
                    err
                }
            });
        }
    }

    static async addRecipientsToDatabase(campaignItem, recipientLists) {
        try {
            const intendedRecipientIds = recipientLists.map((recipient) => recipient.subscriber._id);

            await CampaignItem.addIntendedRecipientsToCampaignItems(
                String(campaignItem._id),
                intendedRecipientIds
            );
            logger.info({
                message: {
                    title: `intended recipients added to campaign item ID: ${campaignItem._id}`,
                    campaignItemId: campaignItem._id,
                    campaignId: campaignItem.campaign_id,
                    method: 'addRecipientsToDatabase',
                    class: 'ChildEmailScheduler'
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in in addRecipientsToDatabase',
                    campaignItem,
                    recipientLists,
                    method: 'addRecipientsToDatabase',
                    class: 'ChildEmailScheduler',
                    err
                }
            });
        }
    }
}

module.exports = ChildEmailScheduler;
