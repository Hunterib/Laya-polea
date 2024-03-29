import { build, PluginBuild, Plugin, OnLoadArgs, BuildOptions } from "esbuild";
import crc from "crc";
import { NodeVM, VMScript } from "vm2";
import path from "path";
import { ConfigManager, getNanoSecTime, UserConfig } from "../builtin";
import globby from "globby";
import fs from "fs";
import del from "del";
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
        // incremental: true,
        metafile: true,
        format: "cjs",
        loader: { ".ts": "ts", ".js": "js" },
    };

    const result = await build(buildConfig);
    const { text } = result.outputFiles[0];
    const vm = new NodeVM({
        require: {
            context: "sandbox",
            builtin: ["*"],
            mock: { "@polea/builtin": require("../builtin/") },
        },
        console: "inherit",
        nesting: true
    });
    // vm.setGlobals(window)

    let vmcode = new VMScript(text)

    let dconf = await vm.run(vmcode).default;
    return dconf;
}

export function out_config(projectPath: string, platform: string = "") {
    if (platform != "web") {
        platform = "." + platform;
    } else {
        platform = "";
    }
    let hash: string = crc.crc32(projectPath).toString(36)
    return path.resolve(__dirname, `../config${platform}.${hash}.js`);
}

//编译成本地文件执行
export async function buildConfigEx(projectPath: string, cmd: string, platform: string = ""): Promise<ConfigManager> {

    let configFile = await globby([path.resolve(__dirname, `../${cmd}.*.*`)])
    for (const iterator of configFile) {
        let stat = fs.statSync(iterator)
        if (Date.now() - Math.floor(stat.ctimeMs) > 2592000000) {//2592000000=30 * 24 * 60 * 60 * 1000
            await del(iterator, { force: true });
        }
    }

    let pro = process.hrtime.bigint();
    if (platform != "web") {
        platform = "." + platform;
    } else {
        platform = "";
    }
    let hash: string = crc.crc32(projectPath).toString(36)
    let config_path = path.resolve(projectPath, `.polea/${cmd}${platform}.ts`);
    let out_config = path.resolve(__dirname, `../${cmd}${platform}.${hash}.js`);
    let buildConfig: BuildOptions = {
        entryPoints: [config_path],
        outfile: out_config,
        write: true,
        platform: "node",
        bundle: true,
        banner: { js: 'var polea = require("./builtin/")' },
        target: ["node12"],
        // incremental: true,
        metafile: true,
        format: "cjs",
        loader: { ".ts": "ts", ".js": "js" },
    };
    // buildConfig.watch = {
    //     onRebuild: (error, result) => {
    //         if (error) {
    //             console.error("watch build failed:", error);
    //         } else {
    //             console.log("rebuild")
    //             delete require.cache[require.resolve(buildConfig.outfile)];
    //         }
    //     },
    // };
    const result = await build(buildConfig);
    delete require.cache[require.resolve(buildConfig.outfile)]
    let bconf = require(buildConfig.outfile).default;
    return bconf;
}
