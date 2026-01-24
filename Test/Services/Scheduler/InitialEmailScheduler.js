const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const InitialEmailScheduler = require('../../../App/Services/Scheduler/InitialEmailScheduler');

describe('InitialEmailScheduler Service Test', () => {
    it('should add recipients to given campaignitem id', async () => {
        await InitialEmailScheduler.addRecipientsToDatabase('000000000000000000000029', [{ id: '000000000000000000000030' }, { id: '000000000000000000000031' }]);
        console.log('addRecipientsToDatabase() is completed.');
    });
    it('should start the process', async () => {
        await InitialEmailScheduler.process();
        console.log('process() completed.');
    });
});
