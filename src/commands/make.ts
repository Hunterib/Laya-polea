import cprocess from "child_process";
import readline from "readline";
var os = require("os");
import fs from "fs";
import { getNanoSecTime } from "../builtin";
import del from "del";
import { command } from "../command";
import chalk from "chalk";
var pjson = require("../../package.json");

export class make extends command {
	private output: string = "./template/";
	protected onConstruct(): void {
		this.program.description(chalk.green("构建cli工具"));
	}
	protected async execute() {
		this.spinner.start("cli构建中....");
		let cpf = cprocess.exec(`node_modules/.bin/tsc -d -p ./src/builtin/ --outFile ${this.output}temp/api.js`);
		cpf.on("close", () => this.handlerDTSCode());
	}

	private async handlerDTSCode() {
		let fWrite = fs.createWriteStream(`${this.output}api.d.ts`);
		let fReads = fs.createReadStream(`${this.output}temp/api.d.ts`);
		del(`${this.output}temp/`);

		let rl = readline.createInterface({ input: fReads });
		let index = 1;
		rl.on("line", (line) => {
			let str = null;
			if (/(export|import).*?from/.test(line)) {
			} else if (/(declare|module).*?".*?"/.test(line)) {
				str = line.replace(/".*?"/, pjson.name);
			} else {
				str = line;
			}
			if (str) {
				fWrite.write(`${str + os.EOL}`); // 下一行
				index++;
			}
		});
		rl.on("close", () => {
			this.spinner.succeed("构建完成：" + getNanoSecTime(this.stime));
		});
	}
}
