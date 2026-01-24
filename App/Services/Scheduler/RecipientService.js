const SentMail = require('../../Infrastructure/MongoRepository/DbHandlers/SentMail');
const Recipient = require('../../Infrastructure/MongoRepository/DbHandlers/Recipient');
const CampaignItem = require('../../Infrastructure/MongoRepository/DbHandlers/CampaignItem');
const Campaign = require('../../Infrastructure/MongoRepository/DbHandlers/Campaign');
const Reply = require('../../Infrastructure/MongoRepository/DbHandlers/Reply');
const logger = require('../../../Config/Logger');

class RecipientService {
    static async filterByItemType(campaignItem, recipients) {
        let result = null;
        try {
            const parentCampaign = await CampaignItem.getCampaignSingleItem(
                campaignItem.parent_id
            );
            const parentOpenedRecipientIds = parentCampaign.opened.map(
                (obj) => obj.recipient_id
            );
            const parentClickedRecipientIds = parentCampaign.clicked.map(
                (obj) => obj.recipient_id
            );

            switch (campaignItem.item_type) {
            case 'initial' || 'drip':
                result = recipients;
                break;
            case 'open':
                result = RecipientService.findCommon(recipients, parentOpenedRecipientIds);
                break;
            case 'noopen':
                result = RecipientService.removeFromList(recipients, parentOpenedRecipientIds);
                break;
            case 'click':
                result = RecipientService.findCommon(recipients, parentClickedRecipientIds);
                break;
            default:
                result = recipients;
                break;
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in filterByItemType',
                    campaignItem,
                    recipients,
                    method: 'filterByItemType',
                    class: 'RecipientService',
                    err
                }
            });
        }
        return result;
    }

    static async getRecipientByCampaignItemId(campaignItemId) {
        try {
            let intendedRecipients = await Recipient.getRecipientsByCampaignItemId(
                campaignItemId
            );
            const mailItemDetails = await CampaignItem.getCampaignItemDataForCreatingMails(
                campaignItemId
            );
            /** filter out paused recipients */
            if ('pausedRecipients' in mailItemDetails) {
                const pausedRecipients = mailItemDetails.pausedRecipients.recipient_ids.map(
                    (value) => String(value)
                );
                intendedRecipients = RecipientService.removeFromList(
                    intendedRecipients,
                    pausedRecipients
                );
            }
            /** filter out unsubscribed recipients */
            if ('team' in mailItemDetails) {
                if ('unsubscribers' in mailItemDetails.team) {
                    const unsubscribedRecipients = mailItemDetails.team.unsubscribers.map(
                        (value) => {
                            let returnValue = String(value.id);
                            if (value.recipient_id) {
                                returnValue = String(value.recipient_id);
                            }
                            return returnValue;
                        }
                    );
                    intendedRecipients = RecipientService.removeFromList(
                        intendedRecipients,
                        unsubscribedRecipients
                    );
                }
            }
            const campaignItem = await CampaignItem.getCampaignSingleItem(
                campaignItemId
            );
            const campaign = await Campaign.getCampaignByCampaignId(
                String(campaignItem.campaign_id)
            );
            if (campaign.stop_follow_up) {
                const recipientsWhoReplied = await Reply.getAllRecipientsWithReplies(
                    String(campaignItem.campaign_id)
                );
                intendedRecipients = RecipientService.removeFromList(
                    intendedRecipients,
                    recipientsWhoReplied
                );
            }
            if (campaignItem.item_type === 'initial') {
                return intendedRecipients;
            }
            /** filter by parent's sent items */
            const parentRecipientIds = await SentMail.getSentMailRecipientIdsByCampaignItemId(
                String(campaignItem.parent_id)
            );
            intendedRecipients = RecipientService.findCommon(
                intendedRecipients,
                parentRecipientIds
            );

            /** filter by campaign item type */
            return await RecipientService.filterByItemType(
                campaignItem,
                intendedRecipients
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getRecipientByCampaignItemId',
                    campaignItemId,
                    method: 'getRecipientByCampaignItemId',
                    class: 'RecipientService',
                    err
                }
            });
        }
        return [];
    }

    static findCommon(intendedRecipients, givenList) {
        try {
            const intendedRecipientIds = intendedRecipients.map((value) => String(value.subscriber._id));
            const commonElements = intendedRecipientIds
                .filter((recipientId) => givenList.includes(recipientId));
            return RecipientService.filterByRecipientIds(
                intendedRecipients,
                commonElements
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in findCommon',
                    intendedRecipients,
                    givenList,
                    method: 'findCommon',
                    class: 'RecipientService',
                    err
                }
            });
        }
        return [];
    }

    static removeFromList(intendedRecipients, givenList) {
        try {
            return RecipientService.filterByRecipientIds(intendedRecipients, givenList, true);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in removeFromList',
                    intendedRecipients,
                    givenList,
                    method: 'removeFromList',
                    class: 'RecipientService',
                    err
                }
            });
        }
        return [];
    }

    static ifPresentThenExclude(recipientId, givenList) {
        return !givenList.includes(recipientId);
    }

    static ifPresentThenInclude(recipientId, givenList) {
        return givenList.includes(recipientId);
    }

    static filterByRecipientIds(
        intendedRecipients,
        recipientIds,
        inverse = false
    ) {
        let returnValue = false;
        try {
            return intendedRecipients.filter((value) => {
                if (value.subscriber._id) {
                    if (inverse) {
                        returnValue = RecipientService.ifPresentThenExclude(String(value.subscriber._id),
                            recipientIds);
                    } else {
                        returnValue = RecipientService.ifPresentThenInclude(String(value.subscriber._id),
                            recipientIds);
                    }
                }
                return returnValue;
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in filterByRecipientIds',
                    intendedRecipients,
                    recipientIds,
                    inverse,
                    method: 'filterByRecipientIds',
                    class: 'RecipientService',
                    err
                }
            });
        }
        return returnValue;
    }
}

module.exports = RecipientService;
