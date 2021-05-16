import chalk from "chalk";
import { build, BuildOptions, BuildResult, OnLoadArgs, OnResolveArgs, Plugin, PluginBuild } from "esbuild";
import { readFileSync } from "fs";
import globby from "globby";
import path from "path";
import { NodeVM, VMScript } from "vm2";
import { command } from "../command";
// import { getNanoSecTime } from "../tool/Utils";
import { getNanoSecTime } from "../builtin/index";

export class vm extends command {
    protected onConstruct(): void {
        this.program.description(chalk.green("开发测试"));
    }

    async execute() {
        let verFilter = ["./bin/**/*.json"];
        let resule = await globby(verFilter, {
            expandDirectories: true,
            dot: true,
            ignore: ["*/.DS_Store"],

            // cwd:"./bin"
        });
        console.log(resule);

        console.log(chalk.dim("use `--host` to expose"));

        let result = await build({
            entryPoints: resule,
            outdir: path.resolve(this.workspace, "assets"),
            // assetNames: "[dir]",
            assetNames: "assets/[dir]/[name]-[hash]", //
            // outfile: path.resolve(this.workspace, "assets"),
            minify: true,
            loader: {
                ".json": "file",
            },

            metafile: true,
            // loader: {
            // 	".json": "json", ".js": "binary", ".png": "binary",
            // 	".wav": "binary", ".WAV": "binary", ".mp3": "binary", ".atlas": "json", ".proto": "binary",
            // 	".ogg": "binary", ".zip": "binary", ".jpg": "binary", ".sk": "binary", ".fui": "binary", ".html": "binary", ".xml": "binary", ".sql": "binary", ".rec": "binary"
            // },
            // outExtension: { ".png": "file" },
            // treeShaking: "ignore-annotations",
        });
        // console.log(result);
        // for (const iterator of resule) {
        // }
        console.log(getNanoSecTime(this.stime));

        process.exit();
    }
}
