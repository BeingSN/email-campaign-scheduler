const mongoose = require('mongoose');

const Replies = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    team_id: mongoose.Schema.Types.ObjectId,
    email_id: String,
    allowed_team_members: [mongoose.Schema.Types.ObjectId],
    campaign_id: mongoose.Schema.Types.ObjectId,
    campaignitem_id: mongoose.Schema.Types.ObjectId,
    category: { type: String, enum: ['interested', 'not-interested', 'not-now', 'never-contact'] },
    email_body: String,
    email_date: String,
    email_from: String,
    email_subject: String,
    email_to: String,
    isHtml: false,
    recipient_id: mongoose.Schema.Types.ObjectId,
    sent_mail_id: mongoose.Schema.Types.ObjectId,
    team_lead: mongoose.Schema.Types.ObjectId,
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: false
});

const RepliesModel = mongoose.model('replies', Replies);

module.exports = RepliesModel;
