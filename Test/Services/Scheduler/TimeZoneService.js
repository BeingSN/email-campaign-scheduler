const { expect } = require('chai');
const { it, describe } = require('mocha');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const TimeZoneService = require('../../../App/Services/Scheduler/TimeZoneService');

const sendingCalendar = {
    _id: new ObjectId('000000000000000000000038'),
    service_email: 'test@example.com',
    service_type: 'gauth',
    user_id: new ObjectId('000000000000000000000039'),
    block_days: [
        1,
        0,
        0,
        0,
        0,
        0,
        1
    ],
    created_at: new Date().toUTCString(),
    end_time: '19:00:00',
    max_mails_at_time: 15,
    max_mails_per_day: 400,
    min_mails_at_time: 5,
    minutes_between_sends: 5,
    no_of_retries: 3,
    start_time: '6:00:00',
    strategy: 0,
    time_zone: 10,
    updated_at: new Date().toUTCString()
};

const allowedRange = {
    start: sendingCalendar.start_time,
    end: sendingCalendar.end_time,
    timeZoneId: sendingCalendar.time_zone
};

describe('TimeZone Service Test', () => {
    it('should return boolean on isStartAndEndTimeValid', async () => {
        console.log(TimeZoneService.isStartAndEndTimeValid(allowedRange));
    });
});
