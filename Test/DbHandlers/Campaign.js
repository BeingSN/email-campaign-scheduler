const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const Campaign = require('../../App/Infrastructure/MongoRepository/DbHandlers/Campaign');

const userId = '000000000000000000000001';
const campaignId = '000000000000000000000002';
const status = 'completed';

describe('Campaign DbHandler Test', () => {
    it('should return campaign by status', async function () {
        this.timeout(10000);
        const campaigns = await Campaign.getCampaignsByStatus('completed');
        console.log(campaigns);
        expect(campaigns)
            .to
            .be
            .an('array');
    });
    it('should return campaign by user id', async function () {
        this.timeout(10000);
        const campaigns = await Campaign.getCampaignByUserId(userId);
        console.log(campaigns);
        expect(campaigns)
            .to
            .be
            .an('array');
    });
    it('should return campaign by campaign id', async function () {
        this.timeout(10000);
        const campaign = await Campaign.getCampaignByCampaignId(campaignId);
        console.log(campaign);
        expect(campaign)
            .to
            .an('object');
    });
    it('should return campaigns which are ready to run', async function () {
        this.timeout(10000);
        const campaigns = await Campaign.getReadyToRun();
        console.log(campaigns);
        expect(campaigns)
            .to
            .be
            .an('array');
    });
    it('should update the campaign', async function () {
        this.timeout(10000);
        const updatedCampaign = await Campaign.updateCampaignStatus(campaignId, 'completed');
        console.log(updatedCampaign);
        expect(updatedCampaign)
            .to
            .be
            .an('object');
    });
});
