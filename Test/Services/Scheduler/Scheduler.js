const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const Scheduler = require('../../../App/Services/Scheduler/Scheduler');

describe('Scheduler Service Test', () => {
    it('should start process', async () => {
        await Scheduler.process();
        console.log('Scheduler.process() is completed.');
    });
});
