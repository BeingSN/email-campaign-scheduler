const mongoose = require('mongoose');

const CampaignItemsSchema = mongoose.Schema({
    campaign_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        enum: [
            'draft',
            'awaited',
            'running',
            'completed',
            'paused',
            'stoped',
            'pending'
        ]
    },
    scheduled_at: {
        type: Date
    },
    delay: {
        type: Number
    },
    item_type: {
        type: String,
        enum: [
            'initial',
            'reply',
            'open',
            'click',
            'noopen',
            'drip'
        ]
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    emailtemplate: {
        value: mongoose.Schema.Types.ObjectId,
        label: String
    },
    is_zapier_open: { type: Boolean },
    is_zapier_noopen: { type: Boolean },
    is_zapier_click: { type: Boolean },
    is_zapier_reply: { type: Boolean },
    is_slack_open: { type: Boolean, default: true },
    is_slack_click: { type: Boolean, default: true },
    is_slack_reply: { type: Boolean, default: true },
    tag: String,
    opened: [
        {
            recipient_id: {
                type: mongoose.Schema.Types.ObjectId
            },
            opened_at: {
                type: Date
            }
        }
    ],
    clicked: [
        {
            recipient_id: {
                type: mongoose.Schema.Types.ObjectId
            },
            link: {
                type: String
            },
            clicked_at: {
                type: Date
            }
        }
    ],
    intendedRecipients: { type: Array, default: [] },
    replied: { type: Array, default: [] },
    hasChild: Boolean,
    childElem: [mongoose.Schema.Types.ObjectId],
    node_id: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

const CampaignItemModel = mongoose.model('campaignitems', CampaignItemsSchema);

module.exports = CampaignItemModel;
