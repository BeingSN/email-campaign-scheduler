const mongoose = require('mongoose');

const AccessSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    role: {
        type: String,
        enum: [
            'admin',
            'manager'
        ]
    }
}, { _id: false });

const CampaignSchema = mongoose.Schema({
    title: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    email_id: {
        type: String
    },
    service_type: { type: String, enum: ['gauth', 'custom-smtp', 'sendgrid', 'amazonses', 'office365'] },
    sender_name: String,
    reply_to: String,
    drip: Number,
    team_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    recipient_groups: [mongoose.Schema.Types.ObjectId],
    stop_follow_up: Boolean,
    status: {
        type: String,
        enum: [
            'draft',
            'running',
            'paused',
            'stoped',
            'completed',
            'awaited'
        ]
    },
    access: [
        AccessSchema
    ],
    recipient_count: Number,
    scheduled_at: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

const CampaignModel = mongoose.model('campaigns', CampaignSchema);

module.exports = CampaignModel;
