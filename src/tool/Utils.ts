import fs from "fs";
/** 拷贝资源 */
export function copy(dirs: Array<string>) {
	return dirs.join("");
}

export function getNanoSecTime(start: bigint) {
	let val: number = +(process.hrtime.bigint() - start).toString(10) / 1000;
	let res = Math.floor(val) / 1000;
	if (res < 1000) {
		return res + "ms";
	} else {
		return Math.floor(res * 10) / 10000 + "s";
	}
}

/** 判断文件十分存在 */
export function fileAccess(path: string): Promise<boolean> {
	return new Promise((resolve) => {
		fs.access(path, (err) => {
			if (err) {
				resolve(false);
				return;
			}
			resolve(true);
		});
	});
}
