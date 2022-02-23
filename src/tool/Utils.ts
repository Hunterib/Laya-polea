
import cprocess from "child_process";
import crypto from "crypto";
import crc from "crc";
/**
 * 统计运行时间长度
 * @param start 开始的时间戳（bigint）
 * @returns
 */
export function getNanoSecTime(start: bigint) {
    let val: number = +(process.hrtime.bigint() - start).toString(10) / 1000;
    let res = Math.floor(val) / 1000;
    if (res < 1000) {
        return res + "ms";
    } else {
        return Math.floor(res * 10) / 10000 + "s";
    }
}


export function exec(cmd: string, success: Function, fail?: Function) {
    let cpf = cprocess.exec(cmd);
    cpf.on("close", () => success());
    if (fail) {
        cpf.on("error", () => fail())
    }
}

/**
 * 获取文件hash
 * @param data 文件数据
 * @param type hash类型
 * @returns 
 */
export function getHash(data: any, type: "crc32" | "md5" = 'crc32',) {
    let contentHash = crypto.createHash("md5").update(data).digest("hex");
    if (type == "crc32") {
        return crc.crc32(contentHash).toString(36);
    } else {
        return contentHash;
    }
}
