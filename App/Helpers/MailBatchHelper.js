const FlowControlService = require('../Services/RateLimiter/FlowControlService');
const logger = require('../../Config/Logger');

const chunkArrayBySize = (arr, chunkSize) => {
    try {
        const newArr = [];
        if (chunkSize < 0) {
            return arr;
        }
        const chunksToDo = Math.floor(arr.length / chunkSize);
        if (chunksToDo) {
            for (let i = 0; i < arr.length; i += chunkSize) {
                newArr.push([...arr.slice(i, i + chunkSize)]);
            }
            return newArr;
        }
    } catch (err) {
        logger.error({
            message: {
                title: 'error occured in chunkArrayBySize',
                arr,
                chunkSize,
                method: 'chunkArrayBySize',
                class: 'MailBatchHelper',
                err
            }
        });
    }

    return [[...arr]];
};


class MailBatchHelper {
    static getRandomInt(min, max) {
        const minVal = Math.ceil(min);
        const maxVal = Math.floor(max);
        return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    }

    static mailBatches(minBatchSize, maxBatchSize, mails) {
        const batches = [];
        const mailsCopy = [...mails];
        try {
            do {
                const randomRange = Math.ceil(MailBatchHelper.getRandomInt(minBatchSize, maxBatchSize));
                const splice = mailsCopy.splice(0, randomRange);
                batches.push([...splice]);
            } while (mailsCopy.length > 0);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in mailBatches',
                    minBatchSize,
                    maxBatchSize,
                    mails,
                    batches,
                    method: 'mailBatches',
                    class: 'MailBatchHelper',
                    err
                }
            });
        }

        return batches;
    }

    static mailChunks(mails, maxBatchSize) {
        let mailChunks = [];
        try {
            mailChunks = chunkArrayBySize(mails, maxBatchSize);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in mailChunks',
                    mails,
                    maxBatchSize,
                    method: 'mailChunks',
                    class: 'MailBatchHelper',
                    err
                }
            });
        }

        return mailChunks;
    }

    static async getMailsBatch(userId, mails, campaignId = null) {
        try {
            const info = await MailBatchHelper.getEmailIdAndServiceType(mails);
            const flowCriteria = await FlowControlService.getFlowCriteriaForUser(
                userId,
                campaignId,
                info.emailId,
                info.serviceType
            );


            const minBatchSize = flowCriteria.getMinBatchSize();
            const maxBatchSize = flowCriteria.getMaxBatchSize();
            if (flowCriteria.getMethod() === 1) {
                return MailBatchHelper.mailBatches(minBatchSize, maxBatchSize, mails);
            }
            return MailBatchHelper.mailChunks(mails, maxBatchSize);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getMailsBatch',
                    userId,
                    mails,
                    campaignId,
                    method: 'getMailsBatch',
                    class: 'MailBatchHelper',
                    err
                }
            });
        }
        return [];
    }

    static getEmailIdAndServiceType(mails) {
        let returnValue = null;
        try {
            if (mails.length > 0) {
                returnValue = {
                    emailId: mails[0].sender_email_id ? mails[0].sender_email_id : null,
                    serviceType: mails[0].service_type ? mails[0].service_type : null
                };
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getEmailIdAndServiceType',
                    mails,
                    method: 'getEmailIdAndServiceType',
                    class: 'MailBatchHelper',
                    err
                }
            });
        }

        return returnValue;
    }
}

module.exports = MailBatchHelper;
