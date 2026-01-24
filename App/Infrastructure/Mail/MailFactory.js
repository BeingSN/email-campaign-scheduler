const async = require('async');
const NodeMailer = require('nodemailer');
const AWS = require('aws-sdk');
const logger = require('../../../Config/Logger');
const { amazonSesDetails, mailFrom } = require('../../../Config');
const template = require('../../Helpers/emailTemplateHelper');


/**
 * It will return the transporter to send mails
 * @returns {Promise<void>}
 */
const getTransporter = async () => NodeMailer.createTransport({
    SES: new AWS.SES(amazonSesDetails)
});

class MailFactory {
    /**
     * It will send the mails
     * @param mailMsg
     * @returns {Promise<void>}
     */
    static async sendMail(mailMsg) {
        const transporter = await getTransporter();
        try {
            await transporter.sendMail(mailMsg);
            logger.info({
                message: {
                    title: 'mail sent successfully using transporter',
                    mailMsg,
                    method: 'sendMail',
                    class: 'MailFactory'
                }
            });
            return mailMsg;
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in sendMail',
                    mailMsg,
                    method: 'sendMail',
                    class: 'MailFactory',
                    err
                }
            });
            return false;
        }
    }

    /**
     * It will prepare the mail to send for all recipients
     * @param mailMessageDetail
     * @param key
     * @returns {Object}
     */
    static bakeMail(mailMessageDetail, key) {
        try {
            const inviteeTemp = MailFactory.getInviteeMailTemplate(key);
            const body = MailFactory.bakeEmailParameters(mailMessageDetail, inviteeTemp.body);
            return {
                html: body,
                subject: inviteeTemp.subject,
                from: mailFrom,
                to: mailMessageDetail.campaign_owner_email
            };
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in bakeMail',
                    mailMessageDetail,
                    key,
                    method: 'bakeMail',
                    class: 'MailFactory',
                    err
                }
            });
        }
        return null;
    }

    static getInviteeMailTemplate(key) {
        try {
            if (key in template) {
                return { subject: template[key].user_Template_subject, body: template[key].body };
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in getInviteeMailTemplate',
                    key,
                    method: 'getInviteeMailTemplate',
                    class: 'MailFactory',
                    err
                }
            });
        }

        return {};
    }

    /**
     *
     * @param bakeWith
     * @param body
     * @returns {*}
     */
    static bakeEmailParameters(bakeWith, body) {
        try {
            Object.keys(bakeWith).map((prop) => {
                const propToReplace = `{{:${prop}}}`;
                const regEx = new RegExp(propToReplace, 'ig');
                body = body.replace(regEx, bakeWith[prop] || '');
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in bakeEmailParameters',
                    bakeWith,
                    body,
                    method: 'bakeEmailParameters',
                    class: 'MailFactory',
                    err
                }
            });
        }

        return body;
    }
}

module.exports = MailFactory;
