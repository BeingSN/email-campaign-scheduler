const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const ChildEmailScheduler = require('../../../App/Services/Scheduler/ChildEmailScheduler');

describe('ChildEmailScheduler Service Test', () => {
    it('should start the process', async () => {
        await ChildEmailScheduler.process();
        console.log('process() completed.');
    });
});
