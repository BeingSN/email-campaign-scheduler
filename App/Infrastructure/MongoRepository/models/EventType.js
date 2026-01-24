const mongoose = require('mongoose');

const EventTypeSchema = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    team_id: mongoose.Schema.Types.ObjectId,
    meeting_team_id: mongoose.Schema.Types.ObjectId,
    active: Boolean,
    name: String,
    description: String,
    internal_note: String,
    location: {
        location: String,
        location_type: { type: String, enum: ['fixed', 'request'], default: 'fixed' }
    },
    slug: { type: String, unique: true },
    color: String,
    duration: Number,
    pooling_type: { type: String, enum: ['round_robin', 'collective', null], default: null },
    invitees_limit: Number,
    kind: { type: String, enum: ['solo', 'group'] },
    owner_type: { type: String, enum: ['user', 'team'] },
    allocation_preference: { type: String, enum: ['availability', 'fairness'], default: 'availability' },
    team_members: [{
        _id: false,
        user_id: mongoose.Schema.Types.ObjectId,
        email_id: String,
        firstname: String,
        lastname: String,
        profile_pic: String,
        priority: Number,
        available: Boolean
    }],
    date_range: {
        period_type: { type: String, enum: ['fixed', 'moving', 'unlimited'] },
        start_date: Date,
        end_date: Date
    },
    time_zone: {
        lock_timezone_enabled: Boolean,
        lock_timezone_content: String
    },
    rules: [{
        _id: false,
        type: { type: String, enum: ['wday', 'date'] },
        intervals: [
            {
                _id: false,
                from: String,
                to: String
            }
        ],
        wday: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        date: Date
    }],
    advance_settings: {
        public: Boolean,
        slot_step: Number,
        daily_events_limit: Number,
        before_buffer_time: Number,
        after_buffer_time: Number
    },
    custom_fields_attributes: [{
        _id: false,
        name: String,
        format: { type: String, enum: ['string', 'text', 'choices_one', 'choices_many', 'number'] },
        enabled: Boolean,
        required: Boolean,
        position: Number,
        answer_choices: [String],
        include_other: Boolean
    }],
    booking_autofill: Boolean,
    notification_type: { type: String, enum: ['calendar', 'email'] },
    cancellation_allowed: Boolean,
    cancellation_policy: String,
    message_customizations: {
        invitee_invitation: {
            enabled: Boolean,
            kind: String,
            body: String,
            subject: String
        },
        invitee_reminder: {
            enabled: Boolean,
            kind: String,
            timings: [
                {
                    _id: false,
                    interval: Number,
                    unit: { type: String, enum: ['days', 'hours', 'minutes'] }
                }
            ],
            body: String,
            subject: String,
            timings_limit: Number
        },
        invitee_cancellation: {
            enabled: Boolean,
            kind: String,
            body: String,
            subject: String
        }
    },
    confirmation_page_type: { type: String, enum: ['internal', 'external'] },
    redirect_url: String,
    another_event_button_content: String,
    another_event_button_enabled: Boolean,
    custom_links: [{
        _id: false,
        content: String,
        enabled: Boolean,
        position: Number,
        url: String
    }],
    google_pixel: String,
    facebook_pixel: String,
    deleted: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, usePushEach: true });

const EventTypeModel = mongoose.model('event_types', EventTypeSchema);

module.exports = EventTypeModel;
