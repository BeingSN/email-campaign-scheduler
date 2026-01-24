const mongoose = require('mongoose');
const CampaignItemModel = require('../models/CampaignItem');
const logger = require('../../../../Config/Logger');

const { ObjectId } = mongoose.Types;

class CampaignItem {
    static async getCampaignsItemsData() {
        try {
            const campaignItems = await CampaignItemModel.find({});
            return campaignItems;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getCampaignsItemsData',
                    method: 'getCampaignsItemsData',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getCampaignsItemDataByCampaignId(campaignId) {
        try {
            const campaignItems = await CampaignItemModel.find({
                campaign_id: campaignId
            });
            return campaignItems;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getCampaignsItemDataByCampaignId',
                    campaignId,
                    method: 'getCampaignsItemDataByCampaignId',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getInitialItemDataByCampaignId(campaignId) {
        try {
            return CampaignItemModel.findOne({
                campaign_id: campaignId,
                item_type: 'initial'
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getInitialItemDataByCampaignId',
                    campaignId,
                    method: 'getInitialItemDataByCampaignId',
                    class: 'CampaignItem',
                    err
                }
            });
            return false;
        }
    }

    static async getCampaignSingleItem(itemId) {
        try {
            const campaignItem = await CampaignItemModel.findOne({_id: new ObjectId(itemId)});
            return campaignItem;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getCampaignSingleItem',
                    itemId,
                    method: 'getCampaignSingleItem',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return null;
    }

    static async getReadyToRun() {
        try {
            const childItems = await CampaignItemModel.find({
                status: 'awaited',
                item_type: { $ne: 'initial' },
                scheduled_at: { $lt: new Date() }
            });
            const filtered = childItems.filter(async (childItem) => {
                const parentItem = await CampaignItemModel.findById(childItem.parent_id);
                if (parentItem.status === 'completed') {
                    return true;
                }
                return false;
            });
            return filtered;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getReadyToRun',
                    method: 'getReadyToRun',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getChildCampaignItems(campaignItemIds) {
        try {
            const CampaignItemIdsFormatted = CampaignItem.setObjectId(campaignItemIds);
            const childItems = await CampaignItemModel.aggregate([
                { $match: { _id: { $in: CampaignItemIdsFormatted } } },
                { $group: { _id: '$campaign_id' } },
                {
                    $lookup: {
                        from: 'campaignitems',
                        localField: '_id',
                        foreignField: 'campaign_id',
                        as: 'campaignitems'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        campaignitems: 1
                    }
                },
                { $unwind: '$campaignitems' },
                { $replaceRoot: { newRoot: '$campaignitems' } }
            ]);
            return childItems;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getChildCampaignItems',
                    campaignItemIds,
                    method: 'getChildCampaignItems',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getAllCampaignItemsOfGivenCampaign(campaignItemIds) {
        try {
            const idArray = CampaignItem.setObjectId(campaignItemIds);
            const campaignItems = await CampaignItemModel.aggregate([
                { $match: { _id: { $in: idArray } } },
                { $group: { _id: '$campaign_id' } },
                {
                    $lookup: {
                        from: 'campaignitems',
                        localField: '_id',
                        foreignField: 'campaign_id',
                        as: 'campaignitems'
                    }
                },
                {
                    $project: {
                        campaignitems: 1,
                        _id: 0
                    }
                },
                { $unwind: '$campaignitems' },
                { $replaceRoot: { newRoot: '$campaignitems' } }
            ]);
            return campaignItems;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getAllCampaignItemsOfGivenCampaign',
                    campaignItemIds,
                    method: 'getAllCampaignItemsOfGivenCampaign',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getCampaignItemDataForCreatingMails(campaignItemId) {
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
                { $unwind: '$campaign' },
                {
                    $lookup: {
                        from: 'campaignitems',
                        localField: 'parent_id',
                        foreignField: '_id',
                        as: 'parent'
                    }
                },
                {
                    $unwind: {
                        path: '$parent',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'templates',
                        localField: 'emailtemplate.value',
                        foreignField: '_id',
                        as: 'template'
                    }
                },
                {
                    $unwind: '$template'
                },
                {
                    $lookup: {
                        from: 'maildetails',
                        localField: 'campaign.user_id',
                        foreignField: 'user_id',
                        as: 'maildetail'
                    }
                },
                {
                    $unwind: '$maildetail'
                },
                {
                    $lookup: {
                        from: 'teams',
                        localField: 'campaign.team_id',
                        foreignField: '_id',
                        as: 'team'
                    }
                },
                {
                    $unwind: '$team'
                },
                {
                    $lookup: {
                        from: 'agency-settings',
                        localField: 'team.agency_id',
                        foreignField: 'agency_id',
                        as: 'agency_settings'
                    }
                },
                {
                    $unwind: {
                        path: '$agency_settings',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'campaign_paused_recipients',
                        localField: 'campaign_id',
                        foreignField: 'campaign_id',
                        as: 'pausedRecipients'
                    }
                },
                {
                    $unwind: {
                        path: '$pausedRecipients',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'sending_calendars',
                        localField: 'campaign.user_id',
                        foreignField: 'user_id',
                        as: 'sending_calendar'
                    }
                },
                {
                    $unwind: {
                        path: '$sending_calendar',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'signatures',
                        localField: 'campaign.user_id',
                        foreignField: 'user_id',
                        as: 'signatures'
                    }
                },
                {
                    $project: {
                        status: 1,
                        item_type: 1,
                        parent_id: 1,
                        hasChild: 1,
                        scheduled_at: 1,
                        childElem: 1,
                        clicked: 1,
                        replied: 1,
                        opened: 1,
                        campaign: 1,
                        parent: 1,
                        template: 1,
                        maildetail: 1,
                        team: 1,
                        pausedRecipients: 1,
                        sending_calendar: 1,
                        signatures: 1,
                        agency_settings: 1
                    }
                }
            ]);
            if (result[0]) {
                return result[0];
            }
            return [];
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getCampaignItemDataForCreatingMails',
                    campaignItemId,
                    method: 'getCampaignItemDataForCreatingMails',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getChildItems(campaignItemId) {
        try {
            const childItems = await CampaignItemModel.find({
                parent_id: campaignItemId
            });
            return childItems;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getChildItems',
                    campaignItemId,
                    method: 'getChildItems',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async getAlreadyRunningCampaign() {
        try {
            const alreadyRunningCampaigns = await CampaignItemModel.find({
                status: 'running'
            });
            return alreadyRunningCampaigns;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getAlreadyRunningCampaign',
                    method: 'getAlreadyRunningCampaign',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static async addIntendedRecipientsToCampaignItems(
        campaignItemId,
        intendedRecipients = []
    ) {
        try {
            await CampaignItemModel.update(
                { _id: new ObjectId(campaignItemId) },
                { $set: {intendedRecipients: intendedRecipients} }
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in addIntendedRecipientsToCampaignItems',
                    method: 'addIntendedRecipientsToCampaignItems',
                    campaignItemId,
                    intendedRecipients,
                    class: 'CampaignItem',
                    err
                }
            });
        }
    }

    static async markCampaignItemAsAwaited(
        campaignItemId,
        status,
        scheduledAt = false
    ) {
        try {
            if (!scheduledAt) {
                await CampaignItemModel.update(
                    { _id: new ObjectId(campaignItemId) },
                    { $set: {status: status} });
            } else {
                await CampaignItemModel.update(
                    { _id: new ObjectId(campaignItemId) },
                    { $set: {status: status, scheduled_at: scheduledAt} });
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in markCampaignItemAsAwaited',
                    method: 'markCampaignItemAsAwaited',
                    campaignItemId,
                    status,
                    scheduledAt,
                    class: 'CampaignItem',
                    err
                }
            });
        }
    }

    static async updateCampaignItemStatus(campaignItemId, status) {
        try {
            let statusToBeUpdated = status;
            if (status === 'delete') {
                statusToBeUpdated = 'pause';
            }

            await CampaignItemModel.update(
                {_id: campaignItemId},
                { $set: {status: statusToBeUpdated} }
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in updateCampaignItemStatus',
                    method: 'updateCampaignItemStatus',
                    campaignItemId,
                    status,
                    class: 'CampaignItem',
                    err
                }
            });
        }
    }

    static async getAllCompletedCampaignIds() {
        try {
            const completedCampaignItems = await CampaignItemModel.find({
                status: 'completed'
            });
            const completedCampaignItemsIds = [];
            completedCampaignItems.map(async (campaignItem) => {
                const nonCompletedCampaignItems = await CampaignItemModel.find({
                    _id: campaignItem.campaign_id,
                    status: { $ne: 'completed' }
                });
                if (nonCompletedCampaignItems.length !== 0) {
                    completedCampaignItemsIds.push(campaignItem.campaign_id);
                }
            });
            return completedCampaignItemsIds;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getAllCompletedCampaignIds',
                    method: 'getAllCompletedCampaignIds',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return [];
    }

    static setObjectId(campaignItemIds) {
        const itemIds = [];
        try {
            campaignItemIds.forEach((campaignItemId) => {
                try {
                    itemIds.push(new ObjectId(campaignItemId));
                } catch (err) {
                    logger.error({
                        message: {
                            title: `error occured while pushing ${campaignItemId} in setObjectId`,
                            method: 'setObjectId',
                            class: 'CampaignItem',
                            err
                        }
                    });
                }
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in setObjectId',
                    campaignItemIds,
                    method: 'setObjectId',
                    class: 'CampaignItem',
                    err
                }
            });
        }
        return itemIds;
    }
}

module.exports = CampaignItem;
