const moment = require('moment');
const logger = require('../../../Config/Logger');
const MailService = require('../Mail/MailService');
const Campaign = require('../../Infrastructure/MongoRepository/DbHandlers/Campaign');

const extractNotificationData = async (meetingData) => {
    try {
        const campaignId = meetingData.campaign_id;
        const campaign = await Campaign.getCampaignByCampaignId(campaignId);
        const user = await Campaign.getUserDetailsByCampaignId(campaignId);
        return {
            campaign_name: campaign.title,
            firstname: user[0].userDetails.firstname,
            campaign_id: campaignId,
            campaign_title: campaign.title,
            campaign_updated_time: moment(campaign.scheduled_at).format('hh:mm:ss a'),
            campaign_updated_date: moment(campaign.scheduled_at).format('Do MMMM, YYYY'),
            campaign_owner_email: campaign.email_id
        };
    } catch (err) {
        logger.error({
            message: {
                title: 'error occured in extractNotificationData',
                meetingData,
                method: 'extractNotificationData',
                class: 'NotificationService',
                err
            }
        });
    }
    return {
        campaign_name: null,
        firstname: null
    };
};


class NotificationService {
    /**
     * @param meetingData
     * @returns {Promise<*>}
     */
    static async notifyCampaignScheduled(meetingData) {
        try {
            const notificationData = await extractNotificationData(meetingData);

            logger.info({
                message: {
                    title: 'meeting scheduled notification',
                    meetingData,
                    notificationData,
                    method: 'notifyCampaignScheduled',
                    class: 'NotificationService',
                    key: 'started'
                }
            });
            return MailService.mailSender(notificationData, 'started');
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in notifyCampaignScheduled',
                    meetingData,
                    method: 'notifyCampaignScheduled',
                    class: 'NotificationService',
                    err
                }
            });
        }
        return null;
    }

    /**
     *
     * @param meetingData
     * @returns {Promise<void>}
     */
    static async notifyCampaignReScheduledDueToFailure(meetingData) {
        try {
            logger.info({
                message: {
                    title: 'Meeting Rescheduled due to failure Notification',
                    meetingData,
                    method: 'notifyCampaignReScheduledDueToFailure',
                    class: 'NotificationService',
                    key: 'rescheduledDueToOtherReasons'
                }
            });
            const notificationData = extractNotificationData(meetingData);
            return MailService.mailSender(notificationData, 'rescheduledDueToOtherReasons');
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in notifyCampaignReScheduledDueToFailure',
                    meetingData,
                    method: 'notifyCampaignReScheduledDueToFailure',
                    class: 'NotificationService',
                    err
                }
            });
        }
        return null;
    }

    /**
     *
     * @param meetingData
     * @returns {Promise<void>}
     */
    static async notifyCampaignApiLimitExceeded(meetingData) {
        try {
            const notificationData = await extractNotificationData(meetingData);
            logger.info({
                message: {
                    title: 'Meeting Rescheduled due to crossing api rate limit',
                    meetingData,
                    notificationData,
                    method: 'notifyCampaignApiLimitExceeded',
                    class: 'NotificationService',
                    key: 'rescheduledDueToApi'
                }
            });
            return MailService.mailSender(notificationData, 'rescheduledDueToApi');
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in notifyCampaignApiLimitExceeded',
                    meetingData,
                    method: 'notifyCampaignApiLimitExceeded',
                    class: 'NotificationService',
                    err
                }
            });
        }
        return null;
    }

    /**
     *
     * @param meetingData
     * @returns {Promise<void>}
     */
    static async notifyCampaignCompleted(meetingData) {
        try {
            const notificationData = await extractNotificationData(meetingData);
            logger.info({
                message: {
                    title: 'Meeting Rescheduled due to crossing api rate limit',
                    meetingData,
                    notificationData,
                    method: 'notifyCampaignCompleted',
                    class: 'NotificationService',
                    key: 'completed'
                }
            });
            return MailService.mailSender(notificationData, 'completed');
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in notifyCampaignCompleted',
                    meetingData,
                    method: 'notifyCampaignCompleted',
                    class: 'NotificationService',
                    err
                }
            });
        }
        return null;
    }
}

module.exports = NotificationService;
