declare module polea {
    /** 拷贝资源 */
    export function copy(dirs: Array<string>): string;
    export function getNanoSecTime(start: bigint): string;
    /** 判断文件十分存在 */
    export function fileAccess(path: string): Promise<boolean>;
}
declare module polea {
    export class CleanPlugin extends pluginsCommand {
        private patterns;
        private force;
        protected name: string;
        /**
         * 请使用当前目录的相对路径
         * @param patterns 匹配文件路径
         * @param force 是否允许删除当前工作目录之外部目录。
         */
        constructor(patterns: string | readonly string[], force?: boolean);
        execute(): Promise<void>;
    }
}
declare module polea {
    export function getLocalIp(): any;
}
declare module polea {
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
        protected abstract name: string;
        spinner: any;
        protected stime: bigint;
        output: string;
        constructor();
        /**
         * 开始运行管线命令
         * */
        execute(arg?: any): Promise<any>;
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
        outfile?: string;
        outputDir?: string;
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
    export interface ConfigCommand {
        command: "compile" | "publish";
    }
}
declare module polea {
    /** 编译ts代码 */
    export class BundlePlugin extends pluginsCommand {
        protected name: string;
        private config;
        constructor(config?: buildConfig);
        execute(): Promise<unknown>;
    }
}
