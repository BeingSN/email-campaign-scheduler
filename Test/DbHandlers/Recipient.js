// eslint-disable-next-line import/no-extraneous-dependencies,no-unused-vars
const { expect } = require('chai');
// eslint-disable-next-line import/no-extraneous-dependencies
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const Recipient = require('../../App/Infrastructure/MongoRepository/DbHandlers/Recipient');

// eslint-disable-next-line no-unused-vars
const campaignId = '000000000000000000000011';
const itemId = '000000000000000000000012';
const campaignItemIds = ['000000000000000000000013', '000000000000000000000014'];
const intentedRecipients = ['000000000000000000000015', '000000000000000000000016', '000000000000000000000017'];


describe('Recipient DbHandler Test', () => {
    it('should return total recipients by campaign item id', async function () {
        this.timeout(10000);
        const totalRecipients = await Recipient.getTotalRecipientsByCampaignItemId(itemId);
        console.log(totalRecipients);
    });
    it('should return paginated recipients by campaign item id', async function () {
        this.timeout(10000);
        const paginatedRecipients = await Recipient.getPaginatedRecipients(itemId);
        console.log(paginatedRecipients);
    });
    it('should return recipients by campaign item id', async function () {
        this.timeout(10000);
        const recipients = await Recipient.getRecipientsByCampaignItemId(itemId);
        console.log(recipients);
    });
});
