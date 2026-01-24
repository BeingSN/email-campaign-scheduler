const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const SentMail = require('../../App/Infrastructure/MongoRepository/DbHandlers/SentMail');

const campaignItemId = '000000000000000000000020';

describe('SentMail DbHandler Test', () => {
    it('should return all sent mail recipients id by given campaign item id', async function () {
        this.timeout(10000);
        const allRecipientsIds = await SentMail.getSentMailRecipientIdsByCampaignItemId(campaignItemId);
        console.log(allRecipientsIds);
    });
});
