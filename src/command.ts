import commander from "commander"

export abstract class command {
    protected program: commander.Command;
    protected workspace: string;
    constructor(program: commander.Command) {
        this.workspace = process.cwd();
        this.workspace = this.workspace.replace(/\\/g, "/")
        this.program = program.command(this.constructor.name.toLowerCase())
        this.program.action((arg) => {
            this.run(arg);
        })
    }

    //抽象方法 ，不包含具体实现，要求子类中必须实现此方法
    abstract run(arg?: any): Promise<any>;
}