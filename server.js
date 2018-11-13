"use strict";
require('dotenv').config();
console.log("enviromnet", process.env.NODE_ENV);
process.env.NODE_CONFIG_DIR = 'Config/';
global.config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const mongoose = require('mongoose');
const app = new express();
const cors = require('cors');
const redis = require('redis');
const helmet = require('helmet');
const methodOverride = require('method-override');
const async = require("async");
const sock_js = require("./Socket/socket");
const log4js = require('log4js');
const logger = log4js.getLogger('[SERVER]');
logger.level = 'debug';

/* 
[START] Middlewares Initilization
*/
app.use(methodOverride());
app.set('json spaces', 1);
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
/* 
[END] Middlewares Initilization
*/

let PORT = config.get("PORT");
const startServer = http.createServer(app).listen(PORT, (err) => {
    return start_initial_process((err, data) => {
        if (err) {
            logger.error("Shutting Down server : ", err);
            return process.exit(1);
        }
        logger.info("Server Started");
    })
});
sock_js.socket_initialize(startServer);

function start_initial_process(parent_callback) {
    let connection_tasks = {
        mongo_connect: function (callback) {
            let options = {
                autoReconnect: true,
                bufferMaxEntries: 0,
                autoIndex: false,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 500,
                poolSize: 50,
                useNewUrlParser: true
            };
            return mongoose.connect(config.get("mongo_db_uri"), options, callback)
        },
        redis_connect: function (callback) {
            global.redis_client = redis.createClient(config.get("redis_port"), config.get('redis_host'));
            redis_client.on('connect', (err, done) => {
                return callback();
            });
            redis_client.on("error", (err) => {
                return callback(err);
            })
        },
    };
    return async.autoInject(connection_tasks, parent_callback);
}
process.setMaxListeners(0);
process.on('unhandledRejection', (err) => {
    logger.error('An unhandledRejection error occurred!');
    logger.error(err.stack)
});
process.on('uncaughtException', function (err) {
    logger.error('An uncaught error occurred!');
    logger.error(err.stack);
});
