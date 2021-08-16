import { command } from "../command";
import { buildConfigEx } from "../tool/config";
import chalk from "chalk";
import { ConfigManager, run } from "../builtin";
import chokidar from "chokidar";

export class Compile_platform extends command {
    protected onConstruct() {
        this.program.description(chalk.green("开始编译项目"));
        this.program.option("-p, --platform <mode>", "发布平台[web]", "web");
        this.program.option("-d, --data <mode>", "命令带入的数据(请勿使用`|、!`来做分割字符，建议使用`,`)");
    }

    async execute(platform: string) {
        if (!platform) {
            platform = this.program.opts().platform;
        }
        let bconf: ConfigManager = await buildConfigEx(this.workspace, "config", platform);
        this.config = bconf.buildConfig({ command: "compile", param: this.program.opts() });
        if (this.config.plugins && this.config.plugins.length > 0) {
            for (let i = 0; i < this.config.plugins.length; i++) {
                this.config.plugins[i].UserConfig = this.config;
                this.config.plugins[i].platform = platform;
                this.config.plugins[i].command = "compile";
                this.config.plugins[i].watch = this.config.watch;
                this.config.plugins[i].workspace = this.workspace;
                this.config.plugins[i].output = this.config.output;
                // this.config.plugins[i].spinner = ora({ text: "Loading unicorns", spinner: "boxBounce2" });
                await this.config.plugins[i].execute();
                if (this.config.watch) {
                    this.config.plugins[i].runWatch();
                }
                run.Plugin = null;
            }
            if (!this.config.watch) {
                process.exit();
            } else { }
        } else {
            process.exit();
        }
    }
}
