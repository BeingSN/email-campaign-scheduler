const MailItemStore = require('../../Infrastructure/RedisRepository/RedisStore/MailItemStore');
const logger = require('../../../Config/Logger');
const CampaignStatusManager = require('../Scheduler/CampaignStatusManager');

class ScheduleMailItems {
    static groupBy(xs, key) {
        return xs.reduce((rv, x) => {
            // eslint-disable-next-line no-param-reassign
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    static async scheduleMailInStore(overAllMails, updateStatus = false) {
        try {
            const groupedByUserList = ScheduleMailItems.groupBy(overAllMails, 'userId');
            // eslint-disable-next-line guard-for-in
            for (const userId in groupedByUserList) {
                const groupedByCampaignId = ScheduleMailItems.groupBy(groupedByUserList[userId], 'campaignId');
                // eslint-disable-next-line guard-for-in
                for (const campaignId in groupedByCampaignId) {
                    await MailItemStore.addToStore(userId, campaignId, groupedByCampaignId[campaignId]);
                    logger.info({
                        message: {
                            title: 'mailItem added to store.',
                            userId,
                            campaignId,
                            mailItem: groupedByCampaignId[campaignId],
                            method: 'scheduleMailInStore',
                            class: 'ScheduleMailItems',
                        }
                    });
                    if (updateStatus) {
                        await CampaignStatusManager.markCampaignAsRunning(campaignId);
                    }
                }
            }
            if (updateStatus) {
                const groupedByCampaignItemId = ScheduleMailItems.groupBy(overAllMails, 'campaignItemId');
                const campaignItemsProcessedInThisRun = Object.keys(groupedByCampaignItemId);
                for (const campaignItemId of campaignItemsProcessedInThisRun) {
                    await CampaignStatusManager.markCampaignItemAsRunning(campaignItemId);
                }
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in scheduleMailInStore',
                    overAllMails,
                    updateStatus,
                    method: 'scheduleMailInStore',
                    class: 'ScheduleMailItems',
                    err
                }
            });
        }
    }
}

module.exports = ScheduleMailItems;
