const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const CampaignOperations = require('../../../App/Services/IncomingMessage/CampaignOperations');

const testMessage = { event: 'campaign.start', body: { campaign_id: '000000000000000000000037' } };


describe('Consumer Service Test', () => {
    it('should start consumer', async () => {
        await CampaignOperations.handle(testMessage);
    });
});
