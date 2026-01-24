const { expect } = require('chai');
// eslint-disable-next-line import/no-extraneous-dependencies
const { it, describe } = require('mocha');
require('../../App/Infrastructure/MongoRepository/Connections');
const ProcessingEmail = require('../../App/Infrastructure/MongoRepository/DbHandlers/ProcessingEmail');

const sendingEmail = 'test@example.com';
const serviceType = 'gauth';

describe('ProcessingEmail DbHandler Test', () => {
    it('should return boolean if email exists', async () => {
        const doesEmailExists = await ProcessingEmail.exist(sendingEmail, serviceType);
        console.log(doesEmailExists);
    });
    it('should return object containing updated processing email and boolean', async () => {
        const { updated, hasIncremented } = await ProcessingEmail.incrementMailCount(sendingEmail, serviceType);
        console.log({
            updated,
            hasIncremented
        });
    });
});
