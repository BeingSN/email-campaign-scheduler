const mongoose = require('mongoose');
const SentMailModel = require('../models/SentMail');
const logger = require('../../../../Config/Logger');

const { ObjectId } = mongoose.Types;

class SentMail {
    static async getSentMailRecipientIdsByCampaignItemId(campaignItemId) {
        try {
            const data = await SentMailModel.aggregate([
                { $match: { campaignitem_id: new ObjectId(campaignItemId) } },
                {
                    $project: {
                        _id: 0,
                        sent: 1
                    }
                }
            ]);
            if (data.length > 0) {
                return data[0].sent.map((value) => String(value.recipient_id));
            }
            return [];
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getSentMailRecipientIdsByCampaignItemId',
                    campaignItemId,
                    method: 'getSentMailRecipientIdsByCampaignItemId',
                    class: 'SentMail',
                    err
                }
            });
        }
        return [];
    }
}

module.exports = SentMail;
