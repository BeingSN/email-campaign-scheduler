const logger = require('../../../Config/Logger');
const CampaignItem = require('../MongoRepository/DbHandlers/CampaignItem');

class ProcessingEmailFactory {
    static setInitialProcessingMail() {
        return {
            transportDetails: [],
            created_at: new Date().toUTCString(),
            updated_at: new Date().toUTCString(),
            error: null,
            mail_count: 1,
            error_count: 0,
            success_count: 0,
            process_at: new Date().toUTCString(),
            client_id: null,
            nonprocessed_count: 0
        };
    }

    static appendInformationFromMailDetailsToProcessingEmail(
        processingEmail,
        mailDetails
    ) {
        try {
            const processingEmailExtended = { ...processingEmail };
            const mailDetailsExtended = { ...mailDetails };
            processingEmailExtended.sender_email = mailDetails.campaign.email_id;
            // Use the first available agency settings
            if (mailDetails.agency_settings && mailDetails.agency_settings.length > 0) {
                mailDetailsExtended.agency_settings = mailDetails.agency_settings[0];
                processingEmailExtended.agency_id = mailDetailsExtended.agency_settings.agency_id;
                processingEmailExtended.domain_name = mailDetailsExtended.agency_settings.domain_name;
            }

            processingEmailExtended.transportDetails = {};
            switch (mailDetails.campaign.service_type) {
            case 'gauth':
                processingEmailExtended.service_type = 'gauth';
                processingEmailExtended.transportDetails.gmail = mailDetails.maildetail.gmail;
                processingEmailExtended.transportDetails.gmail_oauth = mailDetails.agency_settings.gmail_oauth;
                break;
            case 'custom-smtp':
                processingEmailExtended.service_type = 'custom-smtp';
                processingEmailExtended.transportDetails.service = mailDetails.campaign.email_id.indexOf('@gmail') === -1
                    ? 'native'
                    : 'gmail';
                if (mailDetails.maildetail.custom.smtp_creds.host) {
                    processingEmailExtended
                        .transportDetails.host = mailDetails.maildetail.custom.smtp_creds.host;
                }
                if (mailDetails.maildetail.custom.smtp_creds.secure) {
                    processingEmailExtended.transportDetails
                        .secure = mailDetails.maildetail.custom.smtp_creds.secure;
                }
                if (mailDetails.maildetail.custom.smtp_creds.port) {
                    processingEmailExtended
                        .transportDetails.port = mailDetails.maildetail.custom.smtp_creds.port;
                }
                if (mailDetails.maildetail.custom.smtp_creds.require_tls) {
                    processingEmailExtended
                        .transportDetails.require_tls = mailDetails.maildetail.custom.smtp_creds.require_tls;
                }
                if (
                    mailDetails.maildetail.custom.smtp_creds.passwordhash
                    && mailDetails.maildetail.custom.smtp_creds.username
                ) {
                    processingEmailExtended.transportDetails.auth = {
                        user: mailDetails.maildetail.custom.smtp_creds.username,
                        pass: mailDetails.maildetail.custom.smtp_creds.passwordhash
                    };
                }
                break;

            case 'sendgrid':
                processingEmailExtended.service_type = 'sendgrid';
                processingEmailExtended.transportDetails.sendgrid = {
                    api_key: mailDetails.maildetail.sendgrid.api_key,
                    email_id: mailDetails.maildetail.sendgrid.email_id
                };
                break;

            case 'amazonses':
                processingEmailExtended.service_type = 'amazonses';
                processingEmailExtended.transportDetails.amazonses = {
                    region: mailDetails.maildetail.amazonses.region,
                    secret_key: mailDetails.maildetail.amazonses.secret_key,
                    access_key: mailDetails.maildetail.amazonses.access_key
                };
                break;
            default:
                logger.warn('Service Type does not exist');
                break;
            }
            return processingEmailExtended;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in appendInformationFromMailDetailsToProcessingEmail',
                    processingEmail,
                    mailDetails,
                    method: 'appendInformationFromMailDetailsToProcessingEmail',
                    class: 'ProcessingEmailFactory',
                    err
                }
            });
        }
        return {};
    }

    static async createByCampaignItemId(campaignItemId) {
        try {
            const mailDetails = await CampaignItem.getCampaignItemDataForCreatingMails(
                campaignItemId
            );
            const initialProcessingEmail = ProcessingEmailFactory.setInitialProcessingMail();
            return ProcessingEmailFactory
                .appendInformationFromMailDetailsToProcessingEmail(
                    initialProcessingEmail,
                    mailDetails
                );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in createByCampaignItemId',
                    campaignItemId,
                    method: 'createByCampaignItemId',
                    class: 'ProcessingEmailFactory',
                    err
                }
            });
        }
        return null;
    }
}

module.exports = ProcessingEmailFactory;
