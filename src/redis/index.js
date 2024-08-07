const redis = require('redis');

let redisClient;

/**
 * Asynchronously connects to the Redis server using the provided environment variables.
 * Sets up the `redisClient` to be used for Redis operations.
 * Logs the connection status or any errors encountered.
 *
 * @async
 * @function connectRedis
 * @returns {Promise<void>}
 */
async function connectRedis() {
    try {
        redisClient = redis.createClient({
            socket: { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST },
        });
        await redisClient.connect();
        console.info(`--> Redis connected at PORT: ${process.env.REDIS_PORT}, HOST: ${process.env.REDIS_HOST}`);
    } catch (e) {
        console.error("Redis Error", e.message);
    }
}

/**
 * Returns the connected Redis client instance.
 * Ensure that `connectRedis` has been called and completed successfully before calling this function.
 *
 * @function getRedisClient
 * @returns {Object} The Redis client instance.
 */
function getRedisClient() {
    return redisClient;
}

/**
 * Method is use to check if key exist in redis
 *
 * @param key
 * @return {Promise<boolean>}
 */
async function checkRedisKeyExist(key) {
    try {
        return !!(await redisClient.get(key))
    }
    catch (e) {
        throw e;
    }
}

module.exports = { connectRedis, getRedisClient, checkRedisKeyExist };
