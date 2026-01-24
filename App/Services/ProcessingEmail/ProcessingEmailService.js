const ProcessingEmailFactory = require('../../Infrastructure/ProcessingEmail/ProcessingEmailFactory');
const ProcessingEmail = require('../../Infrastructure/MongoRepository/DbHandlers/ProcessingEmail');
const logger = require('../../../Config/Logger');

class ProcessingEmailService {

    static async updateInStore(campaignItemId) {
        try {
            const processingEmail = await ProcessingEmailFactory.createByCampaignItemId(
                campaignItemId
            );
            const doesEmailExists = await ProcessingEmail.exist(
                processingEmail.sender_email,
                processingEmail.service_type
            );
            if (doesEmailExists) {
                const {
                    hasIncremented,
                    updated
                } = await ProcessingEmail.incrementMailCount(
                    processingEmail.sender_email,
                    processingEmail.service_type,
                    doesEmailExists._id
                );
                if (hasIncremented) {
                    return updated;
                }
            }
            return await ProcessingEmail.upsert(processingEmail);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in updateInStore',
                    campaignItemId,
                    method: 'updateInStore',
                    class: 'ProcessingEmailService',
                    err
                }
            });
        }
        return {};
    }
}

module.exports = ProcessingEmailService;
