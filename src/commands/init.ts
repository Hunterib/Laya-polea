import chalk from "chalk";
import { command } from "../command";

export default class init extends command {
    protected onConstruct(): void {
        this.program.description(chalk.green("初始化项目配置目录"));
    }
    protected async execute() {}
}
