import commander from "commander";
import ora from "ora";

export abstract class command {
	protected program: commander.Command;
	protected spinner: ora.Ora = ora({ text: "Loading unicorns", spinner: "boxBounce2" });
	protected workspace: string;
	constructor(program?: any) {
		this.workspace = process.cwd();
		this.workspace = this.workspace.replace(/\\/g, "/");
		this.program = program.command(this.constructor.name.toLowerCase());
		this.program.helpOption("-h, --help", "命令帮助");
		this.onConstruct();
		this.program.action((arg) => {
			this.run(arg);
		});
	}
	/** 初始化命令 */
	protected abstract onConstruct(): void;

	//抽象方法 ，不包含具体实现，要求子类中必须实现此方法
	protected abstract run(arg?: any): Promise<any>;
}
