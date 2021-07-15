import chalk from "chalk";
import path from "path";
import cprocess from "child_process";
import { FileUtile, getNanoSecTime, pluginsCommand } from ".";
import chokidar from "chokidar";
import { run } from "../tool/run";


export class UIPlugin extends pluginsCommand {
    public name: string = "ui-plugin";
    private manifest: any = {};

    // let clear = this.program.opts().clear || false;
    // let mode = this.program.opts().mode || "normal";
    // let code = this.program.opts().code || true;
    // let atlas = this.program.opts().atlas || true;
    constructor(private clear: boolean = false, private mode: string = "normal", private code: boolean = true, private atlas: boolean = true) {
        super();
    }

    async execute() {
        super.execute(arguments);

        let projPath = this.workspace;
        if (FileUtile.exists(path.join(projPath, "laya", ".laya")) == false) {
            this.spinner.fail(chalk.red("不是一个正确的项目,请在项目根目录执行命令"));
            return
        }

        let clear = this.clear || false;
        let mode = this.mode || "normal";
        let code = this.code || true;
        let atlas = this.atlas || true;
        return new Promise((resolve, reject) => {
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
                run.Plugin = null;
                resolve(null)
            });
        })

    }

    public async runWatch() {
        let projPath = this.workspace;
        var watcher = chokidar.watch(path.join(projPath, "laya"), {
            ignoreInitial: true,
            ignored: /.map/
            // cwd:this.output
        });
        let tt: any = null;
        watcher.on("all", (event, _path, details) => {
            if (tt == null) {
                this.stime = process.hrtime.bigint();
                console.log(`${chalk.magentaBright(`UI Watch:`)}`)
            }
            clearTimeout(tt);
            console.log(`${chalk.blueBright(" |-") + chalk.greenBright(`${event}`)}`, `${chalk.blackBright(_path.replace(path.join(projPath, "../"), "~/"))}`)
            tt = setTimeout(async () => {
                clearTimeout(tt);
                tt = null;
                await this.execute();
                run.Plugin = null;
                console.log(`${chalk.magentaBright(`UI Watch End!`)} ` + chalk.green(getNanoSecTime(this.stime)))
            }, 2)
        })
    }
}