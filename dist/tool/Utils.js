"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNanoSecTime = exports.copy = void 0;
/** 拷贝资源 */
function copy(dirs) {
    return dirs.join("");
}
exports.copy = copy;
function getNanoSecTime(start) {
    let val = +(process.hrtime.bigint() - start).toString(10) / 1000;
    let res = Math.floor(val) / 1000;
    if (res < 1000) {
        return res + "ms";
    }
    else {
        return Math.floor(res * 10) / 10000 + "s";
    }
}
exports.getNanoSecTime = getNanoSecTime;
