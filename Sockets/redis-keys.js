"use strict";
let redis_keys = {};
function generate_redis_key() {
    return Array.prototype.slice.call(arguments).join("-");
}
redis_keys.app_name = config.get("app_name");
redis_keys.user_key_prefix = generate_redis_key(redis_keys.app_name, "user");
redis_keys.generate_redis_key = generate_redis_key;

module.exports = redis_keys;