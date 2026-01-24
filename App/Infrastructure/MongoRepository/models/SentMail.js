const mongoose = require('mongoose');

const SentMailSchema = mongoose.Schema({
    campaignitem_id: mongoose.Schema.Types.ObjectId,
    campaign_id: mongoose.Schema.Types.ObjectId,
    team_id: mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId,
    email_id: String,
    sent: [
        {
            message_id: String,
            thread_id: String,
            recipient_id: mongoose.Schema.Types.ObjectId,
            recipient_email: String,
            sent_at: Date,
            status: {
                type: String,
                enum: [
                    'sent',
                    'failed',
                    'bounced'
                ]
            },
            error: [{
                strict: false
            }]
        }
    ]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, usePushEach: true });

const SentMailModel = mongoose.model('sentmails', SentMailSchema);

module.exports = SentMailModel;
