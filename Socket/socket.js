"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('[SOCKET]');
logger.level = 'debug';
exports.socket_initialize = function (http_server) {
    logger.info("Start Socket Initialization");
    let socketIO = require('socket.io').listen(http_server);
    socketIO.use((socket, callback) => {
        logger.info("Socket Middleware : ", socket.request.headers);
        return callback();
    });
    socketIO.on("connection", (socket) => {
        logger.info("Socket Connected :", socket.id);
        socket.on("message", (data, socket_callback) => {
            if (typeof socket_callback == "function") {
                return socket_callback("Recieved from callback");
            }
            return socketIO.to(socket.id).emit("emitmessage", "EMIT : " + data);
        });
        socket.on('disconnect', (data) => {
            logger.info("Socket disconnect :", data);
            socket.conn.close();
        });
    });
}