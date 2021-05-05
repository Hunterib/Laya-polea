// /**
//  * 构建管线命令
//  */
// export interface pluginsCommand {
// 	/** 插件名称 */
// 	name: string;
// 	/**
// 	 * 开始运行管线命令
// 	 */
// 	execute(params?: any): Promise<any | void>;
// }

import ora from "ora";
import { Plugin } from "esbuild";

export abstract class pluginsCommand {
	/** 插件名称 */
	protected abstract name: string;
	public spinner: ora.Ora;
	protected stime: bigint;
	constructor() {}

	/**
	 * 插件执行
	 * process.hrtime.bigint();
	 * */
	public abstract execute(arg?: any): Promise<any>;
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
	/** 输出文件的位置 */
	outDir?: string;
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
	plugins: Plugin[];
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
export * from "../tool/net";
