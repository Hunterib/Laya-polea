/**
 * ConfigManager 配置文件
 */
export type ConfigManager = {
	/**
	 * 构建与发布配置
	 */
	buildConfig: (param: ConfigCommand) => UserConfig;
};

export interface UserConfigError {
	msg?: string;
}

export declare interface ConfigCommand {
	command: "compile" | "publish";
}

export interface DevServer {
	/** 端口 */
	port?: number;
	/** 自动打开浏览器 */
	open?: boolean;
	/** 服务根目录 */
	servedir?: string;
}

export interface UserConfig extends UserConfigError {
	plugins?: Array<plugins.Command>;
	entry: Array<string>;
	define?: Record<string, any>;
	outfile?: string; //输出的文件
	outputDir?: string; //输出文件的位置
	server?: false | DevServer;
	watch?: boolean;
	pure?: Array<any>;
}

export namespace plugins {
	/**
	 * 构建管线命令
	 */
	export interface Command {
		/**
		 * 开始运行管线命令
		 */
		execute(params: any): Promise<any | void>;

		[options: string]: any;
	}
}
