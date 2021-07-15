import del from "del";
import gulp from "gulp";
const uglify = require("gulp-uglify-es").default;
const jsonminify = require("gulp-jsonminify");

const rev = require("gulp-rev");
const revdel = require("gulp-rev-delete-original");

import { command } from "../command";
import esbuild from "esbuild";
import chalk from "chalk";
import ora from "ora";
import { ConfigManager } from "../builtin";
import { buildConfigEx, buildConfigVM } from "../tool/config";

export default class publish extends command {
    protected onConstruct(): void {
        this.program.description(chalk.green("发布项目"));
        this.program.option("-V, --Version <mode>", "发布文件名字");
        this.program.option("-m, --minify <mode>", "压缩JS文件", true);
    }

    async execute() {
        let platform = this.program.opts().platform;
        let bconf: ConfigManager = await buildConfigEx(this.workspace, platform);
        this.config = bconf.buildConfig({ command: "publish" });
        if (this.config.plugins && this.config.plugins.length > 0) {
            for (let i = 0; i < this.config.plugins.length; i++) {
                this.config.plugins[i].UserConfig = this.config;
                this.config.plugins[i].platform = platform;
                this.config.plugins[i].command = "publish";
                this.config.plugins[i].watch = this.config.watch;
                this.config.plugins[i].workspace = this.workspace;
                this.config.plugins[i].output = this.config.output;
                await this.config.plugins[i].execute();
            }
            process.exit();
        } else {
            process.exit();
        }

        // console.log(arguments);
        // await this.clearReleaseDir();
        // await this.copyFile();
        // await this.build();
        // if (this.program.opts().minify == true || this.program.opts().minify == "true") {
        // 	await this.compressJs();
        // 	await this.compressJson();
        // 	await this.version1();
        // }
    }

    private async clearReleaseDir() {
        let projPath = this.workspace;
        let platform = this.program.opts().platform;
        // let releaseDir = projPath + "/release/" + platform;
        let releaseDir = "./release/" + platform;
        let releaseDir1 = "../test/release/" + platform;
        let delList = [`${releaseDir}/**`, `!${releaseDir}/config/**`, releaseDir + "_pack"];
        await del(delList, { force: false });
    }

    private async build() {
        const spinner = ora("Loading unicorns");
        spinner.color = "green";
        spinner.text = chalk.red("正在编译中...");
        spinner.start();
        console.time(`[${chalk.yellowBright(this.program.opts().platform)}]发布文件编译完成`);
        let projPath = this.workspace;
        let platform = this.program.opts().platform;
        let outPath = `${projPath}/release/${platform}/js/bundle.js`;
        await esbuild
            .build({
                define: { VERSION: "2" },
                entryPoints: [`${projPath}/src/Main.ts`],
                bundle: true,
                minify: false,
                keepNames: true,
                sourcemap: false,
                write: true,
                format: "iife",
                treeShaking: true,
                outfile: outPath,
            })
            .then((value: any) => {
                spinner.stop();
                console.timeEnd(`[${chalk.yellowBright(this.program.opts().platform)}]发布文件编译完成`);
            });
    }

    private async copyFile() {
        return new Promise(resolve => {
            console.time(chalk.blue("开始拷贝"));
            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let releaseDir = projPath + "/release/" + platform;
            let baseCopyFilter = [
                `${projPath}/bin/**/*.*`,
                `!${projPath}/bin/indexmodule.html`,
                `!${projPath}/bin/import/*.*`,
                `!${projPath}/bin/js/*.*`,
            ];

            let stream = gulp.src(baseCopyFilter, { base: `${projPath}/bin` });
            stream.pipe(gulp.dest(releaseDir)).on("finish", (err: any) => {
                console.timeEnd(chalk.blue("开始拷贝"));
                resolve(null);
            });
        });
    }

    private async compressJs(): Promise<void> {
        return new Promise(resolve => {
            console.time("压缩JS文件");
            const spinner = ora("Loading unicorns");
            spinner.color = "yellow";
            spinner.text = chalk.red("正在压缩中...");
            spinner.start();

            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let releaseDir = projPath + "/release/" + platform;
            let compressJsFilter = [releaseDir + "/**/*.js", `!${releaseDir}/libs/min/**/*.js`];
            let options = {
                mangle: {
                    keep_fnames: true,
                },
            };

            // console.log("compressJsFilter: ", compressJsFilter);
            gulp.src(compressJsFilter, { base: releaseDir })
                .pipe(uglify(options))
                .on("error", function (err: any) {
                    console.warn(err.toString());
                })
                .pipe(gulp.dest(releaseDir))
                .on("finish", function (err: any) {
                    spinner.stop();
                    console.timeEnd("压缩JS文件");
                    resolve();
                });
        });
    }

    private async compressJson(): Promise<void> {
        return new Promise(resolve => {
            console.time("压缩JSON文件");
            const spinner = ora("Loading unicorns");
            spinner.color = "yellow";
            spinner.text = chalk.red("正在压缩JSON中...");
            spinner.start();

            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let releaseDir = projPath + "/release/" + platform;

            console.log(releaseDir);
            gulp.src([releaseDir + "/**/*.{json,atlas}"], { base: releaseDir })
                .pipe(jsonminify())
                .pipe(gulp.dest(releaseDir))
                .on("finish", function (err: any) {
                    spinner.stop();
                    console.timeEnd("压缩JSON文件");
                    resolve();
                });
        });
    }

    private async version1(): Promise<void> {
        return new Promise(resolve => {
            console.time("生成版本管理json");
            const spinner = ora("Loading unicorns");
            spinner.color = "yellow";
            spinner.text = chalk.red("正在压缩JSON中...");
            spinner.start();

            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let releaseDir = projPath + "/release/" + platform;

            let config = [
                `${releaseDir}/**/*.*`,
                `!${releaseDir}/*.html`,
                `!${releaseDir}/{version.json,game.js,game.json,project.config.json,weapp-adapter.js,project.swan.json,swan-game-adapter.js,main.js,gameConfig.json,my-adapter.js,microgame-adapter.js,qg-adapter.js,huawei-adapter.js,adapter.js,}`,
                `!${releaseDir}/layaforqq/**/*.*`,
            ];
            gulp.src(config, { base: releaseDir })
                .pipe(rev())
                .pipe(gulp.dest(releaseDir))
                .pipe(revdel())
                .pipe(rev.manifest("version.json"))
                .pipe(gulp.dest(releaseDir))
                .on("finish", function (err: any) {
                    spinner.stop();
                    console.timeEnd("生成版本管理json");
                    resolve();
                });
        });
    }
}
