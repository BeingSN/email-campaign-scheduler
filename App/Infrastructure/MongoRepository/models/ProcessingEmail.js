const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const ProcessingEmailsSchema = mongoose.Schema({
    domain_name: String,
    agency_id: String,
    process_at: {
        type: Date,
        default: new Date()
    },
    mail_count: Number,
    success_count: { type: Number, default: 0 },
    error_count: { type: Number, default: 0 },
    nonprocessed_count: { type: Number, default: 0 },
    sender_email: String,
    service_type: {
        type: String,
        enum: ['custom-smtp', 'gauth', 'sendgrid', 'amazonses']
    },
    client_id: String,
    transportDetails: {
        service: String,
        gmail_oauth: {
            client_id: String,
            client_secret: String,
            redirect_uris: String
        },
        gmail: {
            sendAsEmails: { type: [String], default: [] },
            username: String,
            access_creds: {
                access_token: {
                    type: String
                },
                refresh_token: {
                    type: String
                },
                expiry_date: {
                    type: String
                },
                token_type: {
                    type: String
                }
            }
        },
        sendgrid: {
            api_key: String,
            email_id: String
        },
        amazonses: {
            region: String,
            access_key: String,
            secret_key: String
        },
        host: String,
        port: Number,
        secure: Boolean,
        requireTLS: Boolean,
        auth: {
            user: String,
            pass: String
        },
        tls: {
            rejectUnauthorized: { type: Boolean, default: false }
        }
    },
    error: {
        type: String,
        default: null
    }
}, {
    strict: false,
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}, { strict: false, versionKey: false });

const ProcessingEmailsModel = mongoose.model('processing-emails', ProcessingEmailsSchema);

module.exports = ProcessingEmailsModel;
