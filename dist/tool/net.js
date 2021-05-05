"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalIp = void 0;
var os = require("os");
function getLocalIp() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        if (ifaces[dev][1].address.indexOf("192.168") != -1) {
            return ifaces[dev][1].address;
        }
    }
    return "127.0.0.1";
}
exports.getLocalIp = getLocalIp;
