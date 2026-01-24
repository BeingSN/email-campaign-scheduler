#!/usr/bin/env node

const program = require('commander');

require('../Infrastructure/MongoRepository/Connections');
require('../Infrastructure/RedisRepository/Connections');
require('./app');


const {
    childEmailSchedulerAction,
    initialEmailSchedulerAction,
    schedulerProcessAction,
    runningCampaignItemWatcherAction,
    runningCampaignWatcherAction,
    campaignOpConsumerAction
} = require('../Commands/actions');


/**
 * This file implements the commander which starts the app
 */

program.version('0.0.1')
    .description('NodeJS-Scheduler');

program.command('start')
    .description('this is the main command which should be used to start the whole app')
    .action(() => {
        initialEmailSchedulerAction();

        childEmailSchedulerAction();

        schedulerProcessAction();

        (async () => {
            await campaignOpConsumerAction();
        })();

        runningCampaignItemWatcherAction();

        runningCampaignWatcherAction();
    });

program.command('scheduler:initialEmails')
    .description('this schedules the initial emails')
    .action(() => {
        initialEmailSchedulerAction();
    });

program.command('scheduler:childEmails')
    .description('this initiates child emails')
    .action(() => {
        childEmailSchedulerAction();
    });

program.command('scheduler:process')
    .description('this starts the scheduler process')
    .action(() => {
        schedulerProcessAction();
    });

program.command('watcher:runningCampaignItems')
    .description('this initiates the campaign item watcher')
    .action(() => {
        runningCampaignItemWatcherAction();
    });

program.command('watcher:runningCampaigns')
    .description('this initiates the campaign watcher')
    .action(() => {
        runningCampaignWatcherAction();
    });

program.command('campaignOps:consumer')
    .description('this initiates the consumer')
    .action(async () => {
        await campaignOpConsumerAction();
    });


program.parse(process.argv);
