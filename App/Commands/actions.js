const cron = require('node-cron');
const logger = require('../../Config/Logger');
const InitialEmailScheduler = require('../Services/Scheduler/InitialEmailScheduler');
const ChildEmailScheduler = require('../Services/Scheduler/ChildEmailScheduler');
const Scheduler = require('../Services/Scheduler/Scheduler');
const RunningCampaignItemWatcher = require('../Services/Watcher/RunningCampaignItemWatcher');
const RunningCampaignWatcher = require('../Services/Watcher/RunningCampaignWatcher');
const Consumer = require('../Services/RabbitMQ/Consumer');

const initialEmailSchedulerAction = () => {
    cron.schedule('* * * * *', async () => {
        await InitialEmailScheduler.process();
    });
};

const childEmailSchedulerAction = () => {
    cron.schedule('* * * * *', async () => {
        await ChildEmailScheduler.process();
    });
};

const schedulerProcessAction = () => {
    cron.schedule('* * * * *', async () => {
        await Scheduler.process();
    });
};

const runningCampaignItemWatcherAction = () => {
    cron.schedule('* * * * *', async () => {
        await RunningCampaignItemWatcher.watch();
    });
};

const runningCampaignWatcherAction = () => {
    cron.schedule('* * * * *', async () => {
        await RunningCampaignWatcher.watch();
    });
};

const campaignOpConsumerAction = async () => {
    try {
        await Consumer.process();
    } catch (err) {
        logger.error({
            message: {
                title: 'error occured during consumer process',
                action: 'campaignOpConsumerAction',
                err
            }
        });
    }
};

module.exports = {
    initialEmailSchedulerAction,
    childEmailSchedulerAction,
    schedulerProcessAction,
    runningCampaignItemWatcherAction,
    runningCampaignWatcherAction,
    campaignOpConsumerAction
};
