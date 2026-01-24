const MailFactory = require('../../Infrastructure/Mail/MailFactory');
const logger = require('../../../Config/Logger');

class MailService {
    /**
     * It will bake and send the mails
     * @param mailMessageDetail
     * @param key
     * @returns {Promise<void>}
     */
    static async mailSender(mailMessageDetail, key) {
        try {
            const mail = MailFactory.bakeMail(mailMessageDetail, key);

            return MailFactory.sendMail(mail);
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in mailSender',
                    mailMessageDetail,
                    key,
                    method: 'mailSender',
                    class: 'MailService',
                    err
                }
            });
        }
        return null;
    }
}

module.exports = MailService;
