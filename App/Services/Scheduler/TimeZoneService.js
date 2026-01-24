const moment = require('moment');
const logger = require('../../../Config/Logger');
const timeZoneMappingData = require('../../Helpers/timeZoneMappingData');


const parseLabelToOnlyGMT = (label) => {
    const includingGMTString = label.split(')')[0];
    const excludingGMTFromString = includingGMTString.split('(')[1];
    const onlyGMTOffsetString = excludingGMTFromString.split('GMT')[1];
    return onlyGMTOffsetString;
};


class TimeZoneService {
    /**
   *  checks if user's timezone and program's utc timezone's start and end
   *  time match
   *  @param {Object} allowedRange
   * @returns {Boolean}
   */
    static isStartAndEndTimeValid(allowedRange) {
        try {
            /**
             * mapping part
             */
            const timeZoneObj = timeZoneMappingData.find((obj) => obj.value === Number(allowedRange.timeZoneId));
            const timeZoneStr = parseLabelToOnlyGMT(timeZoneObj.label);
            /**
             * convert this program's timezone to userTimeZone
             */

            const date = moment().utcOffset(timeZoneStr).format('HH:mm:ss').toString();
            let [sHours, sMinutes, sSeconds] = allowedRange.start.split(':');
            let [eHours, eMinutes, eSeconds] = allowedRange.end.split(':');
            if (sHours.length === 1) {
                sHours = `0${sHours}`;
            }
            if (eHours.length === 1) {
                eHours = `0${sHours}`;
            }
            /**
             * check if time is withing user's start and end time
             */
            const isValid = date > `${sHours}:${sMinutes}:${sSeconds}` && date < `${eHours}:${eMinutes}:${eSeconds}`;

            // return isValid;
            return isValid;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in isStartAndEndTimeValid',
                    allowedRange,
                    method: 'isStartAndEndTimeValid',
                    class: 'TimeZoneService',
                    err
                }
            });
        }
        return false;
    }
}

module.exports = TimeZoneService;
