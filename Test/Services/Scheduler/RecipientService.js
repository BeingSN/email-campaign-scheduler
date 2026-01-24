const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const RecipientService = require('../../../App/Services/Scheduler/RecipientService');

describe('RecipientService Service Test', () => {
    it('should add recipients to given campaignitem id', async () => {
        this.timeout(10000);
        await RecipientService.getRecipientByCampaignItemId('000000000000000000000036');
        console.log('getRecipientByCampaignItemId() is completed.');
    });
});
