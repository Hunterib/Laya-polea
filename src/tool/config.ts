import { build, PluginBuild, Plugin, OnLoadArgs, BuildOptions } from "esbuild";
import { readFileSync } from "fs";
import { NodeVM, VMScript } from "vm2";
import path from "path";
import { ConfigManager, UserConfig } from "../builtin";

/**
 * 编译成虚拟文件在虚拟环境中执行代码
 * @param projectPath 项目路径
 * @param platform 平台
 * @returns
 */
export async function buildConfigVM(projectPath: string, platform: string = ""): Promise<ConfigManager> {
    if (platform != "web") {
        platform = "." + platform;
    } else {
        platform = "";
    }
    let config_path = path.resolve(projectPath, `.laya-cli/config${platform}.ts`);
    let out_config = path.resolve(__dirname, `../config${platform}.js`);
    let buildConfig: BuildOptions = {
        entryPoints: [config_path],
        outfile: out_config,
        write: false,
        platform: "node",
        bundle: true,
        banner: { js: 'var polea = require("@polea/builtin");' },
        target: ["node12"],
        incremental: true,
        metafile: true,
        format: "cjs",
        loader: { ".ts": "ts", ".js": "js" },
    };

    const result = await build(buildConfig);
    const { text } = result.outputFiles[0];
    const vm = new NodeVM({
        require: {
            builtin: ["*"],
            mock: { "@polea/builtin": require("../builtin/") },
            external: true,
            root: [__dirname],
        },
    });
    let dconf = await vm.run(new VMScript(text)).default;
    return dconf;
}

//编译成本地文件执行
export async function buildConfigEx(projectPath: string, platform: string = ""): Promise<ConfigManager> {
    if (platform != "") {
        platform = "." + platform;
    }
    let config_path = path.resolve(projectPath, `.laya-cli/config${platform}.ts`);
    let out_config = path.resolve(__dirname, `../config${platform}.js`);
    let buildConfig: BuildOptions = {
        entryPoints: [config_path],
        outfile: out_config,
        write: true,
        platform: "node",
        bundle: true,
        banner: { js: 'var polea = require("@polea/builtin");' },
        target: ["node12"],
        incremental: true,
        metafile: true,
        format: "cjs",
        loader: { ".ts": "ts", ".js": "js" },
    };
    const result = await build(buildConfig);
    let bconf = require(buildConfig.outfile).default;
    return bconf;
}
