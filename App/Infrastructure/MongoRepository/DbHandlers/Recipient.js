const mongoose = require('mongoose');
const CampaignItemModel = require('../models/CampaignItem');
const logger = require('../../../../Config/Logger');

const { ObjectId } = mongoose.Types;

const OFFSET = 10000;

class Recipient {
    static async getTotalRecipientsByCampaignItemId(campaignItemId) {
        try {
            const result = await CampaignItemModel.aggregate([
                { $match: { _id: { $eq: new ObjectId(campaignItemId) } } },
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaign_id',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                {
                    $lookup: {
                        let: { teamId: '$campaign.team_id' },
                        from: 'contacts',
                        pipeline: [
                            { $match: { $expr: { $eq: ['$team_id', '$$teamId'] } } },
                            {
                                $count: 'subscriber_count'
                            }
                        ],
                        as: 'subscribers'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        subscriber_count: {
                            $arrayElemAt: [
                                '$subscribers.subscriber_count', 0
                            ]
                        }
                    }
                }
            ]);

            if (result[0]) {
                return result[0].subscriber_count;
            }
            return [];
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getTotalRecipientsByCampaignItemId',
                    campaignItemId,
                    method: 'getTotalRecipientsByCampaignItemId',
                    class: 'RateLimitingConfig',
                    err
                }
            });
        }
        return [];
    }

    static async getPaginatedRecipients(
        campaignItemId,
        offset = 0,
        limit = 10000
    ) {
        try {
            const result = await CampaignItemModel.aggregate([
                { $match: { _id: new ObjectId(campaignItemId) } },
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaign_id',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                {
                    $project: {
                        team_id: {
                            $arrayElemAt: [
                                '$campaign.team_id', 0
                            ]
                        },
                        recipient_groups: {
                            $arrayElemAt: [
                                '$campaign.recipient_groups', 0
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        let: {
                            teamId: '$team_id',
                            recipientGroups: '$recipient_groups'
                        },
                        from: 'contacts',
                        pipeline: [
                            {
                                $match: { $expr: { $eq: ['$team_id', '$$teamId'] } }
                            },
                            { $unwind: '$groups' },
                            {
                                $match: { $expr: { $in: ['$groups', '$$recipientGroups'] } }
                            },
                            { $skip: offset },
                            { $limit: limit }
                        ],
                        as: 'subscriber'
                    }
                },
                {
                    $unwind: '$subscriber'
                }
            ]);

            return result;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getPaginatedRecipients',
                    campaignItemId,
                    offset,
                    limit,
                    method: 'getPaginatedRecipients',
                    class: 'RateLimitingConfig',
                    err
                }
            });
        }
        return [];
    }

    static async getRecipientsByCampaignItemId(campaignItemId) {
        try {
            let limit = 10000;
            const totalContacts = await Recipient.getTotalRecipientsByCampaignItemId(
                campaignItemId
            );
            const totalPages = Math.ceil(totalContacts / OFFSET);
            let recipientsToSend = [];

            let offset = 0;
            for (let i = 0; i < totalPages; i++) {
                try {
                    const recipients = await Recipient.getPaginatedRecipients(
                        campaignItemId,
                        offset,
                        limit
                    );
                    recipientsToSend = recipientsToSend.concat(recipients);
                    offset += OFFSET;
                    limit += OFFSET;
                } catch (err) {
                    logger.error({
                        message: {
                            title: 'error occured while iterating through totalPages in getRecipientsByCampaignItemId',
                            campaignItemId,
                            totalPages,
                            method: 'getRecipientsByCampaignItemId',
                            class: 'RateLimitingConfig',
                            err
                        }
                    });
                }
            }
            return recipientsToSend;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getRecipientsByCampaignItemId',
                    campaignItemId,
                    method: 'getRecipientsByCampaignItemId',
                    class: 'RateLimitingConfig',
                    err
                }
            });
        }
        return [];
    }
}

module.exports = Recipient;
