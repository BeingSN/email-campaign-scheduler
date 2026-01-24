const ReplyModel = require('../models/Reply');
const logger = require('../../../../Config/Logger');

class Reply {
    static async getAllRecipientsWithReplies(campaignItemId) {
        try {
            const data = await ReplyModel.find({ campaign_id: campaignItemId });
            return Array.from(new Set(data.map((value) => String(value.recipient_id))));
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getAllRecipientsWithReplies',
                    campaignItemId,
                    method: 'getAllRecipientsWithReplies',
                    class: 'Reply',
                    err
                }
            });
        }
        return [];
    }
}

module.exports = Reply;
