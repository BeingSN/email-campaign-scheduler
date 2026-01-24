const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const Campaign = require('../../../App/Infrastructure/MongoRepository/DbHandlers/Campaign');
const MailFactory = require('../../../App/Infrastructure/Mail/MailFactory');

const extractNotificationData = async (meetingData) => {
    try {
        const campaignId = meetingData.campaign_id;
        const campaign = await Campaign.getCampaignByCampaignId(campaignId);
        const user = await Campaign.getUserDetailsByCampaignId(campaignId);
        return {
            campaign_name: campaign.title,
            firstname: user[0].userDetails.firstname
        };
    } catch (e) {
        console.error(e);
    }
    return {
        campaign_name: null,
        firstname: null
    };
};

describe('NotificationService Service Test', () => {
    it('should return baked mail', async function () {
        this.timeout(1000000);
        const inviteeTemp = await MailFactory.getInviteeMailTemplate('started');
        console.log('inviteeTemp', inviteeTemp);
        const campaignData = await extractNotificationData({ campaign_id: '000000000000000000000021' });
        console.log('campaignData', campaignData);
        const bakedParams = await MailFactory.bakeEmailParameters(campaignData, inviteeTemp.body);
        console.log('bakedParams', bakedParams);
    });
});
