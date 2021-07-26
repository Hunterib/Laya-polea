import chalk from "chalk";
import commander from "commander";
import ora from "ora";
import { UserConfig } from "./builtin";

export abstract class command {
    protected program: commander.Command;
    protected spinner: ora.Ora = ora({ text: "Loading unicorns", spinner: "boxBounce2" });
    protected workspace: string;
    protected stime: bigint;
    protected config: UserConfig;
    constructor(program?: commander.Command) {
        this.workspace = process.cwd();
        this.workspace = this.workspace.replace(/\\/g, "/");
        let names = this.constructor.name.toLowerCase().split("_")
        let _name = "";
        for (let i = 0; i < names.length; i++) {
            if (i == 0) {
                _name += "" + names[i];
            } else {
                _name += ` [${names[i]}]`;
            }
        }
        this.program = program.command(_name);
        this.program.helpOption("-h, --help", chalk.green("命令帮助"));
        this.onConstruct();
        this.program.action((...arg) => {
            this.stime = process.hrtime.bigint();
            this.execute(...arg);
        });
    }
    /** 初始化命令 */
    protected abstract onConstruct(): void;

    //抽象方法 ，不包含具体实现，要求子类中必须实现此方法
    protected abstract execute(...arg: any): Promise<any>;
}
