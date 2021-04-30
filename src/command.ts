import commander from "commander"

export abstract class command {
    protected program: commander.Command;
    protected config: any;
    protected workspace: string;
    constructor(program?: any) {
        this.workspace = process.cwd();
        this.workspace = this.workspace.replace(/\\/g, "/")
        this.program = program.command(this.constructor.name.toLowerCase())
        // this.config= require(this.workspace+"/.laya-cli/config");
        // console.log(config)
        this.onConstruct();
        this.program.action((arg) => {
            this.run(arg);
        })
    }
    /** 初始化命令 */
    protected abstract onConstruct(): void

    //抽象方法 ，不包含具体实现，要求子类中必须实现此方法
    protected abstract run(arg?: any): Promise<any>;
}