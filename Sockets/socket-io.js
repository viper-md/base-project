"use strict";
const log4js = require('log4js');
const redis_operations = require("./redis-client");
const redis_keys = require("./redis-keys");
const logger = log4js.getLogger('[SOCKET]');
logger.level = 'debug';
let count = 0;
exports.socket_initialize = function (http_server) {
    logger.info("Start Socket Initialization");
    let socketIO = require('socket.io').listen(http_server);
    socketIO.use((socket, callback) => {
        logger.info("Socket Middleware : ");
        return callback();
    });
    socketIO.on("connection", (socket) => {
        logger.info("Socket Connected :", socket.id);
        logger.info("Socket Connections :", ++count);
        let key_name = redis_keys.generate_redis_key(redis_keys.user_key_prefix, socket.id);
        redis_operations.insert_string_into_redis(key_name, socket.id);
        // redis_operations.get_string_from_key(key_name, (err, data) => { logger.debug(err ? err : data) });
        redis_operations.insert_into_redis_hash(key_name + "hash", "socket-id", socket.id);
        // redis_operations.get_hash_map_from_key(key_name + "hash", (err, data) => { logger.debug(err ? err : data) });
        redis_operations.insert_into_redis_hash_map(key_name + "hashmap", { "socket-id": socket.id, userid: key_name, is_map: "YES" });
        // redis_operations.get_hash_map_from_key(key_name + "hashmap", (err, data) => { logger.debug(err ? err : data) });
        socket.on("message", (data, socket_callback) => {
            if (typeof socket_callback == "function") {
                socket_callback("Recieved from callback");
            }
            socketIO.to(socket.id).emit("emitmessage", "EMIT : " + data);
        });
        socket.on('disconnect', (data) => {
            let key_name = redis_keys.generate_redis_key(redis_keys.user_key_prefix, socket.id);
            redis_operations.delete_string_from_redis(key_name);
            logger.info("Socket Connections :", --count);
            logger.info("Socket disconnect :", data);
            socket.conn.close();
        });
    });
}