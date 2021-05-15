import { command } from "../command";
import { buildConfigVM } from "../tool/config";
import chalk from "chalk";
import { ConfigManager, DevServer, getLocalIp, getNanoSecTime, UserConfig } from "../builtin";

export default class Compile extends command {
	protected onConstruct() {
		this.program.description(chalk.green("开始编译项目"));
	}

	async execute() {
		let platform = this.program.opts().platform;
		let bconf: ConfigManager = await buildConfigVM(this.workspace, platform);
		this.config = bconf.buildConfig({ command: "compile" });
		if (this.config.plugins && this.config.plugins.length > 0) {
			for (let i = 0; i < this.config.plugins.length; i++) {
				this.config.plugins[i].output = this.config.output;
				await this.config.plugins[i].execute();
			}
			process.exit();
		} else {
			process.exit();
		}
	}
}
