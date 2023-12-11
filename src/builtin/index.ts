import ora from "ora";
import { run } from "../tool/run";
import chalk from "chalk"

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

type Color =
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray';
type SpinnerName =
    | 'dots'
    | 'dots2'
    | 'dots3'
    | 'dots4'
    | 'dots5'
    | 'dots6'
    | 'dots7'
    | 'dots8'
    | 'dots9'
    | 'dots10'
    | 'dots11'
    | 'dots12'
    | 'dots8Bit'
    | 'line'
    | 'line2'
    | 'pipe'
    | 'simpleDots'
    | 'simpleDotsScrolling'
    | 'star'
    | 'star2'
    | 'flip'
    | 'hamburger'
    | 'growVertical'
    | 'growHorizontal'
    | 'balloon'
    | 'balloon2'
    | 'noise'
    | 'bounce'
    | 'boxBounce'
    | 'boxBounce2'
    | 'triangle'
    | 'arc'
    | 'circle'
    | 'squareCorners'
    | 'circleQuarters'
    | 'circleHalves'
    | 'squish'
    | 'toggle'
    | 'toggle2'
    | 'toggle3'
    | 'toggle4'
    | 'toggle5'
    | 'toggle6'
    | 'toggle7'
    | 'toggle8'
    | 'toggle9'
    | 'toggle10'
    | 'toggle11'
    | 'toggle12'
    | 'toggle13'
    | 'arrow'
    | 'arrow2'
    | 'arrow3'
    | 'bouncingBar'
    | 'bouncingBall'
    | 'smiley'
    | 'monkey'
    | 'hearts'
    | 'clock'
    | 'earth'
    | 'material'
    | 'moon'
    | 'runner'
    | 'pong'
    | 'shark'
    | 'dqpb'
    | 'weather'
    | 'christmas'
    | 'grenade'
    | 'point'
    | 'layer'
    | 'betaWave';
type PrefixTextGenerator = () => string;
export interface Ora {
    /**
    A boolean of whether the instance is currently spinning.
    */
    readonly isSpinning: boolean;

    /**
    Change the text after the spinner.
    */
    text: string;

    /**
    Change the text or function that returns text before the spinner. No prefix text will be displayed if set to an empty string.
    */
    prefixText: string | PrefixTextGenerator;

    /**
    Change the spinner color.
    */
    color: Color;

    /**
    Change the spinner.
    */
    spinner: SpinnerName;

    /**
    Change the spinner indent.
    */
    indent: number;

    /**
    Start the spinner.

    @param text - Set the current text.
    @returns The spinner instance.
    */
    start(text?: string): Ora;

    /**
    Stop and clear the spinner.

    @returns The spinner instance.
    */
    stop(): Ora;

    /**
    Stop the spinner, change it to a green `✔` and persist the current text, or `text` if provided.

    @param text - Will persist text if provided.
    @returns The spinner instance.
    */
    succeed(text?: string): Ora;

    /**
    Stop the spinner, change it to a red `✖` and persist the current text, or `text` if provided.

    @param text - Will persist text if provided.
    @returns The spinner instance.
    */
    fail(text?: string): Ora;

    /**
    Stop the spinner, change it to a yellow `⚠` and persist the current text, or `text` if provided.

    @param text - Will persist text if provided.
    @returns The spinner instance.
    */
    warn(text?: string): Ora;

    /**
    Stop the spinner, change it to a blue `ℹ` and persist the current text, or `text` if provided.

    @param text - Will persist text if provided.
    @returns The spinner instance.
    */
    info(text?: string): Ora;

    /**
    Clear the spinner.

    @returns The spinner instance.
    */
    clear(): Ora;

    /**
    Manually render a new frame.

    @returns The spinner instance.
    */
    render(): Ora;

    /**
    Get a new frame.

    @returns The spinner instance text.
    */
    frame(): string;
}

/**
 * 构建管线命令
 */
export abstract class pluginsCommand {
    /** 插件名称 */
    public name: string = "";
    public spinner: Ora;
    protected stime: bigint;
    /** 平台 */
    public platform: string = "web";
    public command: "compile" | "publish" | string = "compile";
    public output: string = "./dist";
    /** 是否监听文件变化 */
    public watch: boolean = false;
    /** 项目路径 */
    public workspace: string = "";
    protected chalk: any = chalk;
    constructor() {
        this.spinner = ora({ text: "Loading unicorns", spinner: "boxBounce2" }) as Ora;
        this.name = "polea." + this.constructor.name.toLowerCase();
    }

    /**
     * 开始运行管线命令
     * */
    public async execute(arg?: any): Promise<any> {
        run.Plugin = this.name;
        this.stime = process.hrtime.bigint();
    }

    public async runWatch() {

    }

    public UserConfig: UserConfig;
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
    platform?: "browser" | "neutral" | "node";
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
    /** 入口 ['./src/Main.ts'] */
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
    platform?: "browser" | "neutral" | "node";
    /** 插件 */
    plugins?: Plugin[];
    format?: 'iife' | 'cjs' | 'esm'
}

/**
 * ConfigManager 配置文件
 */
export type ConfigManager = {
    /**
     * 构建与发布配置
     */
    buildConfig?: (param: ConfigCommand) => UserConfig;
    execute?: (param: ConfigCommand) => Promise<any>;
};

export declare interface ConfigCommand {
    command: "compile" | "publish" | string;
    param?: any
}

export * from "../tool/Utils";
export * from "../tool/config";
export * from "../tool/run"
export * from "./ESBundlePlugin";
export * from "./CleanPlugin";
export * from "./CopyPlugin";
export * from "./ManifestPlugin";
export * from "./UIPlugin";
export * from "./LayadccPlugin";
export * from "../tool/net";
export * from "../tool/FileUtil";
