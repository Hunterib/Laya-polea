import chalk from "chalk";
import { command } from "../command";

export class task extends command {
	protected onConstruct(): void {
		this.program.description(chalk.green("自定义命令"));
	}

	async execute() {}
}
