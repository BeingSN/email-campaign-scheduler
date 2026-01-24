const { expect } = require('chai');
const { it, describe } = require('mocha');
require('../../../App/Infrastructure/MongoRepository/Connections');
const SendBatchService = require('../../../App/Services/Scheduler/SendBatchService');
const userId = '000000000000000000000032';
const sendBatchService = SendBatchService.create(userId);

describe('SendBatchService Service Test', () => {
    it('should set UserId', async () => {
        await sendBatchService.setUserId();
        console.log(sendBatchService);
    });
    it('should send batches', async () => {
        await sendBatchService.sendBatches(['000000000000000000000033', '000000000000000000000034'], '000000000000000000000035');
        console.log('sendBatchService.sendBatches() completed.');
    });
});
