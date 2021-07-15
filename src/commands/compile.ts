import { command } from "../command";
import { buildConfigEx } from "../tool/config";
import chalk from "chalk";
import { ConfigManager, run } from "../builtin";
import chokidar from "chokidar";

export default class Compile extends command {
    protected onConstruct() {
        this.program.description(chalk.green("开始编译项目"));
    }

    async execute() {
        let platform = this.program.opts().platform;
        let bconf: ConfigManager = await buildConfigEx(this.workspace, platform);
        this.config = bconf.buildConfig({ command: "compile" });
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
            } else {}
        } else {
            process.exit();
        }
    }
}
