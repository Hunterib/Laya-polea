import chalk from "chalk";
import { build, BuildOptions, OnResolveArgs, Plugin, PluginBuild } from "esbuild";
import path from "path";
import { buildConfigEx, ConfigManager, UserConfig } from "../builtin";
import { command } from "../command";
import pLimit from "p-limit";

let fs = require('fs');       //引入文件读取模块
let request = require('request')

export class task_cmd_path extends command {

    protected onConstruct(): void {
        this.program.description(chalk.green("自定义命令"));
    }

    async execute(platform: string, cmd: string) {
        console.log(platform, cmd);

        let bconf: ConfigManager = await buildConfigEx(this.workspace, "task", platform);
        await bconf.execute({ command: cmd });
        process.exit();
    } 
}

