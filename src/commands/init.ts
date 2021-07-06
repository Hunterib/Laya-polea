import chalk from "chalk";
import globby from "globby";
import path from "path";
import { command } from "../command";
import { FileUtile } from "../tool/FileUtil";
import { getNanoSecTime } from "../tool/Utils";

export default class init extends command {
    protected onConstruct(): void {
        this.program.description(chalk.green("初始化项目配置目录"));
    }
    protected async execute() {
        let fromPath: string = path.resolve(__dirname + "./../../", "template");
        let toPath: string = path.resolve(this.workspace, "./.polea")
        if (FileUtile.existsSync(toPath)) {
            this.spinner.succeed("该项目已经初始化了" + getNanoSecTime(this.stime));
            return
        }
        FileUtile.copy(fromPath, toPath);
        this.spinner.succeed("项目初始化完成：" + getNanoSecTime(this.stime));
    }
}
