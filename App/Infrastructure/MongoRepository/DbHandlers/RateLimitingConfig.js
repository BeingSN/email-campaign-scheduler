const SendingCalendarModel = require('../models/SendingCalendar');
const logger = require('../../../../Config/Logger');

const SUNDAY = 0;
const MONDAY = 1;
const SPACEOTD = 1;
const SENDASAP = 2;
class RateLimitingConfig {
    static async getSendingCalendar(userId, emailId = null, serviceType = null) {
        let result = {};
        try {
            if (emailId && serviceType) {
                result = await SendingCalendarModel.findOne({
                    user_id: userId,
                    service_email: emailId,
                    service_type: serviceType
                });
            } else if (emailId && serviceType === null) {
                result = await SendingCalendarModel.findOne({
                    user_id: userId,
                    service_email: emailId
                });
            } else if (serviceType && emailId === null) {
                result = await SendingCalendarModel.findOne({
                    user_id: userId,
                    service_type: serviceType
                });
            } else {
                result = await SendingCalendarModel.findOne({
                    user_id: userId
                });
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getSendingCalendar',
                    userId,
                    emailId,
                    serviceType,
                    method: 'getSendingCalendar',
                    class: 'RateLimitingConfig',
                    err
                }
            });
        }
        return result;
    }

    /**
     * userId
     * emailId
     * serviceType
     */
    static async getConfigForUser(userId, emailId = null, serviceType = null) {
        try {
            const sendingCalendar = await RateLimitingConfig.getSendingCalendar(userId,
                emailId,
                serviceType);
            let blockDays = [SUNDAY, MONDAY];
            if (sendingCalendar.block_days.length > 0) {
                blockDays = [
                    ...sendingCalendar.block_days.map((blockDay, index) => {
                        if (blockDay === 1) { return index; }
                        return null;
                    }).filter((day) => (day !== null))
                ];
            }
            /**
             * check if start and end time valid
             */
            // const isStartAndEndTimeValid = TimeZoneService.isStartAndEndTimeValid(sendingCalendar);

            return {
                blockDays,
                allowedRange: {
                    start: sendingCalendar.start_time
                        ? sendingCalendar.start_time
                        : '00:00:00',
                    end: sendingCalendar.end_time ? sendingCalendar.end_time : '23:59:59',
                    dailyLimit: sendingCalendar.max_mails_per_day
                        ? sendingCalendar.max_mails_per_day
                        : 200,
                    delayInMins: sendingCalendar.minutes_between_sends
                        ? sendingCalendar.minutes_between_sends
                        : 30,
                    minBatchSize: sendingCalendar.min_mails_at_time
                        ? sendingCalendar.min_mails_at_time
                        : 5,
                    maxBatchSize: sendingCalendar.max_mails_at_time
                        ? sendingCalendar.max_mails_at_time
                        : 15,
                    method: sendingCalendar.strategy === 0 ? SPACEOTD : SENDASAP,
                    timeZoneId: sendingCalendar.time_zone
                }
            };
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getConfigForUser',
                    userId,
                    emailId,
                    serviceType,
                    method: 'getConfigForUser',
                    class: 'RateLimitingConfig',
                    err
                }
            });
        }
        return {};
    }
}

module.exports = RateLimitingConfig;
