import path from "path";
import { command } from "../command";
import cprocess from "child_process";
import chalk from "chalk";
import { fileAccess, getNanoSecTime } from "../builtin";

export class ui extends command {
	protected onConstruct(): void {
		this.program.description(chalk.green("导出代码") + chalk.grey("[使用的是layaair2-cmd中的ui导出]"));

		this.program.option("-c --clear", "clear will delete old ui code file.");
		this.program.option("-a --atlas", "generate atlas").option("-d --code", "generate ui code files");
		this.program.option("-m --mode <mode>", "'normal' or 'release', specify 'release' will generate UI code files exclude unused resources.");
	}
	protected async execute() {
		let projPath = this.workspace;

		let clear = this.program.opts().clear || false;
		let mode = this.program.opts().mode || "normal";
		let code = this.program.opts().code || true;
		let atlas = this.program.opts().atlas || true;

		if ((await fileAccess(path.join(projPath, "laya", ".laya"))) == false) {
			this.spinner.fail(chalk.red("不是一个正确的项目,请在项目根目录执行命令"));
			return;
		}

		/////////////////////////////////////////////////////////////
		// Call external interface define in LayaAirCmdTool.max.js //
		/////////////////////////////////////////////////////////////
		var args = [];
		let exe = path.join(__dirname, "/../../libs/", "ProjectExportTools", "LayaAirCmdTool.max.js");
		args.push(path.join(projPath, "laya", ".laya"));
		args.push(`clear=${clear}`);
		args.push(`releasemode=${mode}`);
		args.push(`exportUICode=${code}`);
		args.push(`exportRes=${atlas}`);

		let cpf = cprocess.fork(exe, args);
		cpf.on("close", (code: any) => {
			this.spinner.succeed("ui 导出完成:" + chalk.green(getNanoSecTime(this.stime)));
		});
	}
}
