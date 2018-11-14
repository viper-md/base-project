"use strict";
const _ = require("lodash");
const log4js = require('log4js');
const logger = log4js.getLogger('[REDIS-CLIENT]');
logger.level = 'debug';
exports.get_redis_connection = function (callback) {
    if (redis_client == undefined) {
        const redis = require("redis");
        global.redis_client = redis.createClient(config.get("redis_port"), config.get('redis_host'));
        redis_client.on("connect", () => {
            return callback("Redis Connected Again");
        });
    }
    else {
        return callback("Redis Already Connected");
    }
}
exports.insert_string_into_redis = function (key, value) {
    return module.exports.get_redis_connection(resp => {
        logger.info("insert_string_into_redis : ", key);
        redis_client.set(key, JSON.stringify(value));
        redis_client.expire(key, 7200);
    });
}

exports.delete_string_from_redis = function (key) {
    logger.info("delete_string_from_redis : ", key);
    redis_client.del(key);
}
exports.insert_into_redis_set = function (key, property, value) {
    return module.exports.get_redis_connection(resp => {
        logger.info("insert_into_redis_hash : ", key);
        redis_client.set(key, property, value);
        redis_client.expire(key, 7200);
    });
}
exports.insert_into_redis_hash = function (key, property, value) {
    return module.exports.get_redis_connection(resp => {
        logger.info("insert_into_redis_hash : ", key);
        redis_client.hset(key, property, value);
        redis_client.expire(key, 7200);
    });
}
exports.insert_into_redis_hash_map = function (key, data_to_store) {
    return module.exports.get_redis_connection(resp => {
        logger.info("insert_into_redis_hash : ", key);
        redis_client.hmset(key, data_to_store);
        redis_client.expire(key, 7200);
    });
}
exports.get_hash_map_from_key = function (key, callback) {
    return module.exports.get_redis_connection(resp => {
        logger.info("get_hash_map_from_key : ", key);
        return redis_client.hgetall(key, callback);
    });
}
exports.get_string_from_key = function (key, callback) {
    return module.exports.get_redis_connection(resp => {
        logger.info("get_hash_map_from_key : ", key);
        return redis_client.get(key, callback);
    });
}