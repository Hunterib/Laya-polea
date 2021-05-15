export interface Plugin {
	name: string;
	setup: (build: PluginBuild) => void | Promise<void>;
}

export interface PluginBuild {
	initialOptions: any;
	onStart(callback: () => any): void;
	onEnd(callback: (result: any) => void | Promise<void>): void;
	onResolve(options: any, callback: (args: any) => any): void;
	onLoad(options: any, callback: (args: any) => any): void;
}

/**
 * 构建管线命令
 */
export abstract class pluginsCommand {
	/** 插件名称 */
	protected abstract name: string = "11";
	public spinner: any;
	protected stime: bigint;
	public output: string = "./dist";
	constructor() {}

	/**
	 * 开始运行管线命令
	 * */
	public async execute(arg?: any): Promise<any> {
		this.stime = process.hrtime.bigint();
	}
}

export interface DevServer {
	/** 端口 */
	port?: number;
	/** 自动打开浏览器 */
	open?: boolean;
	/** 服务根目录 */
	servedir?: string;
}

export interface UserConfig {
	output: string;
	plugins?: pluginsCommand[];
	entry?: string[];
	define?: Record<string, any>;
	outfile?: string; //输出的文件
	outputDir?: string; //输出文件的位置

	server?: false | DevServer;
	/** 是否监听文件变化 */
	watch?: boolean;
	/** 压缩时移除的代码 默认值:[] */
	pure?: Array<any>;
	/** 是否压缩代码 */
	minify?: boolean;
	/** 是否有资源map，默认值:true */
	sourcemap?: boolean;
	/** 是否写入文件  默认值:true*/
	write?: boolean;
	/** 全局名称 默认值:polec */
	globalName?: string;
}

export interface buildConfig {
	/** 入口 */
	entry?: Array<string>;
	/** 常量 */
	define?: Record<string, any>;
	/** 输出的文件 */
	outfile?: string;
	server?: false | DevServer;
	/** 是否监听文件变化 */
	watch?: boolean;
	/** 压缩时移除的代码 默认值:[] */
	pure?: Array<any>;
	/** 是否压缩代码 */
	minify?: boolean;
	/** 是否有资源map，默认值:true */
	sourcemap?: boolean;
	/** 是否写入文件  默认值:true*/
	write?: boolean;
	/** 全局名称 默认值:polec */
	globalName?: string;
	/** 插件 */
	plugins?: Plugin[];
}

/**
 * ConfigManager 配置文件
 */
export type ConfigManager = {
	/**
	 * 构建与发布配置
	 */
	buildConfig: (param: ConfigCommand) => UserConfig;
};

export declare interface ConfigCommand {
	command: "compile" | "publish";
}

export * from "../tool/Utils";
export * from "./BundlePlugin";
export * from "./CleanPlugin";
export * from "../tool/net";
