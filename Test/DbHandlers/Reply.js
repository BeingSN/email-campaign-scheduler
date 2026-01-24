const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const Reply = require('../../App/Infrastructure/MongoRepository/DbHandlers/Reply');

const campaignItemId = '000000000000000000000019';

describe('Reply DbHandler Test', () => {
    it('should return all recipients with replies by given campaign item id', async () => {
        const allRecipients = await Reply.getAllRecipientsWithReplies(campaignItemId);
        console.log(allRecipients);
    });
});
