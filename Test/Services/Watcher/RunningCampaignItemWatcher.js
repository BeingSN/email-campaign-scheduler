const { expect } = require('chai');
require('../../../App/Infrastructure/MongoRepository/Connections');
const { it, describe } = require('mocha');
const RunningCampaignItemWatcher = require('../../../App/Services/Watcher/RunningCampaignItemWatcher');
const logger = require('../../../Config/Logger');

describe('RunningCampaignWatcher Service Test', () => {
    it('should watch', async function () {
        this.timeout(1000000);
        await RunningCampaignItemWatcher.watch();

    });
});
