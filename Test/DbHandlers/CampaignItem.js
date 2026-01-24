const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const CampaignItem = require('../../App/Infrastructure/MongoRepository/DbHandlers/CampaignItem');

const campaignId = '000000000000000000000003';
const itemId = '000000000000000000000004';
const campaignItemIds = ['000000000000000000000005', '000000000000000000000006'];
const intentedRecipients = ['000000000000000000000007', '000000000000000000000008', '000000000000000000000009'];


describe('CampaignItem DbHandler Test', () => {
    it('should return campaign items data', async function () {
        this.timeout(100000);
        const campaignitems = await CampaignItem.getCampaignsItemsData();
        console.log(campaignitems);
        // expect(campaignitems).to.be.an('array');
    });
    it('should return campaign items by campaign id', async function () {
        this.timeout(10000);
        const campaigns = await CampaignItem.getCampaignsItemDataByCampaignId(campaignId);
        console.log(campaigns);
        // expect(campaigns).to.be.an('array');
    });
    it('should return single campaign item', async function () {
        this.timeout(10000);
        const campaign = await CampaignItem.getCampaignSingleItem(itemId);
        console.log(campaign);
        // expect(campaign).to.an('object');
    });
    it('should return campaigns which are ready to run', async function () {
        this.timeout(10000);
        const campaigns = await CampaignItem.getReadyToRun();
        console.log(campaigns);
        // expect(campaigns).to.be.an('array');
    });
    it('should return campaign items of a given campaign', async function () {
        this.timeout(10000);
        const campaignItems = await CampaignItem.getAllCampaignItemsOfGivenCampaign(campaignItemIds);
        console.log(campaignItems);
        // expect(updatedCampaign).to.be.an('array');
    });
    it('should return child campaign items when campaignitemids received', async function () {
        this.timeout(10000);
        const childCampaigns = await CampaignItem.getChildCampaignItems(campaignItemIds);
        console.log(childCampaigns);
        // expect(updatedCampaign).to.be.an('array');
    });
    it('should return campaign item data for creating mails', async function () {
        this.timeout(10000);
        const campaignItemData = await CampaignItem.getCampaignItemDataForCreatingMails(itemId);
        console.log(campaignItemData);
        // expect(updatedCampaign).to.be.an('object');
    });

    it('should return child items', async function () {
        this.timeout(10000);
        const childItems = await CampaignItem.getChildItems(itemId);
        console.log(childItems);
    });

    it('should return already running campaign', async function () {
        this.timeout(10000);
        const alreadyRunningCampaign = await CampaignItem.getAlreadyRunningCampaign();
        console.log(alreadyRunningCampaign);
    });

    it('should return updated campaign item on adding intended recipients', async function () {
        this.timeout(10000);
        const updatedCampaignItem = await CampaignItem.addIntendedRecipientsToCampaignItems(itemId, intentedRecipients);
        console.log(updatedCampaignItem);
    });

    it('should return updated campaign item on marked as awaited campaign item', async function () {
        this.timeout(10000);
        const updatedCampaignItem = await CampaignItem.markCampaignItemAsAwaited(itemId, 'awaited');
        console.log(updatedCampaignItem);
    });

    it('should return updated campaign item by updating status', async function () {
        this.timeout(10000);
        const updatedCampaignItem = await CampaignItem.updateCampaignItemStatus(itemId, 'delete');
        console.log(updatedCampaignItem);
    });

    it('should return all completed campaign ids', async function () {
        this.timeout(10000);
        const completedCampaignIds = await CampaignItem.getAllCompletedCampaignIds();
        console.log(completedCampaignIds);
    });

    it('should return object ids from strings', async function () {
        this.timeout(10000);
        const objectIds = await CampaignItem.getInitialItemDataByCampaignId('000000000000000000000010');
        console.log(objectIds);
    });
    // eslint-disable-next-line func-names
});
