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
        this.program = program.command(this.constructor.name.toLowerCase());
        this.program.option("-p, --platform <mode>", "发布平台[web]", "web");
        this.program.helpOption("-h, --help", chalk.green("命令帮助"));
        this.onConstruct();
        this.program.action(arg => {
            this.stime = process.hrtime.bigint();
            this.execute(arg);
        });
    }
    /** 初始化命令 */
    protected abstract onConstruct(): void;

    //抽象方法 ，不包含具体实现，要求子类中必须实现此方法
    protected abstract execute(arg?: any): Promise<any>;
}
