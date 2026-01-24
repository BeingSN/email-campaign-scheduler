const mongooes = require('mongoose');

const SendingCalendarSchema = mongooes.Schema({
    user_id: mongooes.Schema.Types.ObjectId,
    start_time: String,
    end_time: String,
    block_days: Array,
    time_zone: Number,
    max_mails_per_day: { type: Number, default: 500 },
    strategy: { type: Number, default: 0 },
    minutes_between_sends: { type: Number, default: 10 },
    max_mails_at_time: { type: Number, default: 200 },
    min_mails_at_time: { type: Number, default: 15 },
    no_of_retries: { type: Number, default: 3 },
    service_type: String,
    service_email: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

const SendingCalendarModel = mongooes.model('sending_calendar', SendingCalendarSchema);

module.exports = SendingCalendarModel;
