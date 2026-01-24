const MailItemFactory = require('../../Infrastructure/MailItem/MailItemFactory');
const Campaign = require('../../Infrastructure/MongoRepository/DbHandlers/Campaign');
const CampaignItem = require('../../Infrastructure/MongoRepository/DbHandlers/CampaignItem');
const ScheduleMailItems = require('../Scheduler/ScheduleMailItems');
const RecipientService = require('../../Services/Scheduler/RecipientService');
const logger = require('../../../Config/Logger');

class InitialEmailScheduler {
    static async process() {
        try {
            const readyToRunCampaigns = await Campaign.getReadyToRun();

            let overAllMails = [];
            for (const campaign of readyToRunCampaigns) {
                const campaignMails = await InitialEmailScheduler.getOverAllMails(campaign);
                overAllMails = [...overAllMails, ...campaignMails];
            }
            await ScheduleMailItems.scheduleMailInStore(overAllMails, true);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in process',
                    obj: {},
                    method: 'process',
                    class: 'InitialEmailScheduler',
                    err
                }
            });
        }
    }

    static async getOverAllMails(campaign) {
        try {
            const initialItem = await CampaignItem.getInitialItemDataByCampaignId(campaign._id);

            const recipientLists = await RecipientService.getRecipientByCampaignItemId(initialItem._id);

            await InitialEmailScheduler.addRecipientsToDatabase(initialItem, recipientLists);
            return MailItemFactory.generate(
                campaign,
                initialItem,
                recipientLists
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getOverAllMails',
                    campaign,
                    method: 'getOverAllMails',
                    class: 'InitialEmailScheduler',
                    err
                }
            });
        }
    }

    static async addRecipientsToDatabase(campaignItem, recipientLists) {
        try {
            const intendedRecipientIds = recipientLists.map((recipient) => String(recipient.subscriber._id));
            await CampaignItem.addIntendedRecipientsToCampaignItems(
                String(campaignItem._id),
                intendedRecipientIds
            );
            logger.info({
                message: {
                    title: `intended recipients added to campaign item ID: ${campaignItem._id}`,
                    campaignItemId: campaignItem._id,
                    method: 'addRecipientsToDatabase',
                    class: 'InitialEmailScheduler'
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in addRecipientsToDatabase',
                    campaignItem,
                    recipientLists,
                    method: 'addRecipientsToDatabase',
                    class: 'InitialEmailScheduler',
                    err
                }
            });
        }
    }
}

module.exports = InitialEmailScheduler;
