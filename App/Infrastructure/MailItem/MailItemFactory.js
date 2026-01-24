const mongoose = require('mongoose');
const logger = require('../../../Config/Logger');

const { ObjectId } = mongoose.Types;

class MailItemFactory {
    static generate(campaign, initialItem, recipientLists) {
        let mails = [];
        try {
            const mailItem = MailItemFactory.setMailItem(campaign, initialItem);
            recipientLists.forEach(recipient =>{
                mails.push(MailItemFactory.setRecipients(mailItem, recipient));
            });
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in generate',
                    campaign,
                    initialItem,
                    recipientLists,
                    mails,
                    method: 'generate',
                    class: 'MailItemFactory',
                    err
                }
            });
        }
        return mails;
    }

    static setMailItem(campaign, initialItem) {
        try {
            return {
                userId: String(campaign.user_id),
                team_id: String(campaign.team_id),
                service_type: campaign.service_type ? campaign.service_type : null,
                sender_email_id: campaign.email_id ? campaign.email_id : null,
                campaignId: String(initialItem.campaign_id),
                campaignItemId: String(initialItem.id)
            };
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in setMailItem',
                    campaign,
                    initialItem,
                    method: 'setMailItem',
                    class: 'MailItemFactory',
                    err
                }
            });
        }
        return {};
    }

    /**
	 *
	 * @param {Object} mailItem
	 * @param {Object} recipient
	 */
    static setRecipients(mailItem, recipient) {
        var mailItem = JSON.parse(JSON.stringify(mailItem));
        try {
            for (const key in recipient) {
                try {
                    const groupsArr = [];
                    if (recipient[key] instanceof ObjectId) {
                        recipient[key] = new ObjectId(recipient[key]);
                    }
                    if (key === 'recipient_groups') {
                        recipient[key].forEach((group) => {
                            if (group instanceof ObjectId) {
                                groupsArr.push(String(new ObjectId(group)));
                            }
                        });
                        // eslint-disable-next-line no-param-reassign
                        mailItem[key] = groupsArr;
                    }
                    if (key === 'subscriber') {
                        for (const subKey in recipient[key]) {
                            try {
                                if (subKey === '_id') {
                                    // eslint-disable-next-line no-param-reassign
                                    mailItem.recipient_id = recipient[key][subKey];
                                } else {
                                    // eslint-disable-next-line no-param-reassign
                                    mailItem[subKey] = recipient[key][subKey];
                                }
                            } catch (err) {
                                logger.error({
                                    message: {
                                        title: 'error occured in setRecipients iterating subkey in recipient[key]',
                                        subKey,
                                        mailItem,
                                        recipient,
                                        key,
                                        method: 'setRecipients',
                                        class: 'MailItemFactory',
                                        err
                                    }
                                });
                            }
                        }
                    }
                } catch (err) {
                    logger.error({
                        message: {
                            title: 'error occured in setRecipients during iterating key in recipient',
                            recipient,
                            mailItem,
                            key,
                            method: 'setRecipients',
                            class: 'MailItemFactory',
                            err
                        }
                    });
                }
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in setRecipients',
                    recipient,
                    mailItem,
                    method: 'setRecipients',
                    class: 'MailItemFactory',
                    err
                }
            });
        }

        return mailItem;
    }
}

module.exports = MailItemFactory;
