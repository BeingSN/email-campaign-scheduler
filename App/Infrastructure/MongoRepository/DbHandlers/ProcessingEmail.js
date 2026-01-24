const mongoose = require('mongoose');
const ProcessingEmailModel = require('../models/ProcessingEmail');
const logger = require('../../../../Config/Logger');

const { ObjectId } = mongoose.Types;

class ProcessingEmail {
    static async exist(sendingEmail, serviceType) {
        try {
            const response = await ProcessingEmailModel.find({
                sender_email: sendingEmail,
                service_type: serviceType
            });
            if (response.length > 0) {
                return response[0];
            }
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in exist',
                    sendingEmail,
                    serviceType,
                    method: 'exist',
                    class: 'ProcessingEmail',
                    err
                }
            });
        }
        return false;
    }

    static async upsert(processingEmail) {
        let updatedEmail = false;
        try {
            const { sender_email, service_type } = processingEmail;

            await ProcessingEmailModel.findOneAndUpdate(
                {
                    sender_email,
                    service_type
                },
                processingEmail,
                {
                    upsert: true,
                    new: true
                },
                (err, updatedProcessingEmail) => {
                    if (err) {
                        logger.error({
                            message: {
                                title: 'error while updating processing email',
                                method: 'upsert',
                                class: 'ProcessingEmail',
                                err
                            }
                        });
                    }
                    updatedEmail = updatedProcessingEmail;
                    return updatedEmail;
                }
            );
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in upsert',
                    processingEmail,
                    method: 'upsert',
                    class: 'ProcessingEmail',
                    err
                }
            });
        }
        return updatedEmail;
    }

    static async incrementMailCount(
        sendingEmail,
        serviceType,
        processingEmailId
    ) {
        let updatedEmail = null;
        try {
            const updated = await ProcessingEmailModel.update(
                { _id: new ObjectId(processingEmailId) },
                { $inc: { mail_count: 1 } },
                { new: true },
                (err, updatedProcessingEmail) => {
                    updatedEmail = updatedProcessingEmail;
                }
            );
            return {
                updated,
                hasIncremented: true
            };
        } catch (err) {
            logger.error({
                message: {
                    title: 'error occured in incrementMailCount',
                    sendingEmail,
                    serviceType,
                    processingEmailId,
                    method: 'incrementMailCount',
                    class: 'ProcessingEmail',
                    err
                }
            });
        }
        return updatedEmail;
    }
}

module.exports = ProcessingEmail;
