const mongoose = require('mongoose');
const CampaignModel = require('../models/Campaign');
const logger = require('../../../../Config/Logger');

const { ObjectId } = mongoose.Types;
/**
 * This class interacts with campaign's table from MongoDB by interacting
 *  with MongoDB through Mongoose.
 */
class Campaign {
    /**
     * This method returns campaigns by the filter given in parameter.
     *
     * @param {String} status the current state of the campaign
     *
     * @example const campaigns = await Campaign.getCampaignsByStatus('awaited');
     *
     * @returns {Campaign[]}
     */
    static async getCampaignsByStatus(status = 'running') {
        return CampaignModel.find({ status });
    }

    /**
     * This method returns the campaigns which have been scheduled earlier, to start them.
     *
     * @param {String} userId
     *
     * @example const campaigns = await getReadyToRun("5d5ac2e2b1db16502f9fd191");
     *
     * @returns {Campaign[]}
     */
    static async getReadyToRun(userId = null) {
        try {
            const campaigns = userId !== null ? (await CampaignModel.find({
                user_id: userId,
                status: { $eq: 'awaited' }
            })) : (await CampaignModel.find({
                status: { $eq: 'awaited' }
            }));
            return campaigns.filter(
                (campaign) => new Date().getTime() - campaign.scheduled_at.getTime() > 0
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getReadyToRun, returning empty []',
                    userId,
                    method: 'getReadyToRun',
                    class: 'Campaign',
                    err
                }
            });
        }
        return [];
    }

    /**
     *
     * @param {String} campaignId
     *
     * @returns {Campaign}
     */
    static async getCampaignByCampaignId(campaignId) {
        return CampaignModel.findById(campaignId);
    }

    static async getUserDetailsByCampaignId(campaignId) {
        return CampaignModel.aggregate([
            { $match: { _id: { $eq: ObjectId(campaignId) } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' }

        ]);
    }

    /**
     *
     * @param {String} campaignId
     * @param {String} status
     *
     * @returns {Campaign} updated one
     */
    static async updateCampaignStatus(campaignId, status) {
        let campaignReturned = null;
        try {
            let statusToBeUpdated = status;
            if (status === 'delete') {
                statusToBeUpdated = 'pause';
            }

            await CampaignModel.findOneAndUpdate({ _id: campaignId }, {
                status: statusToBeUpdated
            }, { new: true }, (err, updatedCampaign) => {
                if (err) {
                    logger.error({
                        message: {
                            title: 'error occured in updateCampaignStatus',
                            campaignId,
                            status,
                            method: 'updateCampaignStatus',
                            class: 'Campaign',
                            err
                        }
                    });
                }
                campaignReturned = updatedCampaign;
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in updateCampaignStatus',
                    campaignId,
                    status,
                    method: 'updateCampaignStatus',
                    class: 'Campaign',
                    err
                }
            });
        }

        return campaignReturned;
    }

    static async getCampaignByUserId(userId) {
        try {
            return CampaignModel.find({ user_id: userId });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getCampaignByUserId',
                    userId,
                    method: 'getCampaignByUserId',
                    class: 'Campaign',
                    err
                }
            });
        }
        return null;
    }
}

module.exports = Campaign;
