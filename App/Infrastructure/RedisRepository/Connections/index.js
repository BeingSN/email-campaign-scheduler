const redis = require("redis");
const asyncRedis = require("async-redis");

const { REDIS } = require('../../../../Config');
const logger = require('../../../../Config/Logger');

const client = redis.createClient(REDIS.PORT, REDIS.HOST);
const asyncRedisClient = asyncRedis.decorate(client);

client.on('connect', () => {
    logger.info('Redis client connected successfully');
});

module.exports = asyncRedisClient;
