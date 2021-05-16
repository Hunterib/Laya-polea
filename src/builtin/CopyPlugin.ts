import globby from "globby";
import { readFileSync } from "fs";
import pLimit from "p-limit";
import path from "path";
import { FileUtile, getNanoSecTime, pluginsCommand } from ".";
import crypto from "crypto";
import crc from "crc";
import chalk from "chalk";
import ora from "ora";

export type Matcher = {
	/**
	 * 匹配规则可以是数组 (`./bin/**`匹配。./bin/目录下的所有文件)
	 */
	from: string | string[];
	/**
	 * 目标位置
	 * default /release/polea/[path][name]_[hash].[ext]
	 */
	to: string;
	/**
	 * 初始位置，默认是匹配规则的初始位置
	 * default "./"
	 */
	base: string;
};

export class CopyPlugin extends pluginsCommand {
	protected name: string = "copy-plugin";

	/**
	 * 请使用当前目录的相对路径
	 * @param patterns 匹配文件路径
	 * @param force 是否允许删除当前工作目录之外部目录。
	 */
	/**
	 *
	 * @param hash "crc32" | "md5" 拷贝重命名方式
	 * @param matchers 匹配文件路径规则
	 * @param clean 拷贝后是否删除
	 */
	constructor(private hash: "crc32" | "md5", private matchers: Matcher[], private clean: boolean = false) {
		super();
		this.spinner = ora({ text: "Loading unicorns", spinner: "boxBounce2" });
	}

	async execute() {
		super.execute(arguments);
		this.spinner.start("开始拷贝....");

		try {
			const limit = pLimit(100); // 5 表示每次发送5个请求
			await Promise.all(
				this.matchers.map(item =>
					limit(async () => {
						await this.runPattern(item);
					})
				)
			);
			this.spinner.succeed("拷贝完成：" + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
		} catch (error) {
			this.spinner.succeed("拷贝失败：" + JSON.stringify(error));
		}
	}

	private async runPattern(item: Matcher) {
		let resule = await globby(item.from, {
			baseNameMatch: false,
			cwd: path.resolve(process.cwd(), item.base),
			dot: true,
			ignore: ["*/.DS_Store"],
		});

		await Promise.all(
			resule.map(async filepath => {
				let fromFilename = path.resolve(item.base, filepath);

				let data = readFileSync(fromFilename);
				let contentHash = crypto.createHash("md5").update(data).digest("hex");

				const name = path.basename(filepath, path.extname(filepath));
				const extname = path.extname(filepath).substr(1);
				let hash = "";
				if (this.hash == "crc32") {
					hash = crc.crc32(contentHash).toString(36);
				} else {
					hash = contentHash;
				}
				let p = path.dirname(path.join("./", filepath)) + "/";

				const toFilename = item.to.replace("[name]", name).replace("[hash]", hash).replace("[ext]", extname).replace("[path]", p);

				FileUtile.copy(fromFilename, toFilename);
				if (this.clean == true) {
					await FileUtile.removeAsync(fromFilename);
				}
				console.log(hash, toFilename);
			})
		);
	}
}
