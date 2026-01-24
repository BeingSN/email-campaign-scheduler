const { expect } = require('chai');
require('../../../App/Infrastructure/MongoRepository/Connections');
const { it, describe } = require('mocha');
const RunningCampaignWatcher = require('../../../App/Services/Watcher/RunningCampaignWatcher');

describe('RunningCampaignWatcher Service Test', () => {
    it('should watch', async function () {
        this.timeout(1000000);
        await RunningCampaignWatcher.watch();
        console.log('watch() completed.');
    });
});
