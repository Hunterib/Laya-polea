import del from "del"
import gulp from "gulp"
const uglify = require('gulp-uglify-es').default;
import { command } from "../command"
const esbuild = require('esbuild')
import chalk from 'chalk';
import ora from 'ora';

export class publish extends command {
    constructor(par: any) {
        super(par)
        this.program.description("发布项目")
        this.program.option('-p, --platform <mode>', '发布平台[web]', 'web')
        this.program.option('-v, --version <mode>', '发布平台[web]')
        this.program.option('-m, --minify <mode>', '压缩JS文件', true)
    }
    async run() {
        await this.clearReleaseDir()
        await this.copyFile();
        await this.build();
        if (this.program.opts().minify == "true") {
            await this.compressJs();
        }
    }

    private async clearReleaseDir() {
        let projPath = this.workspace;
        let platform = this.program.opts().platform;
        let releaseDir = projPath + "/release/" + platform;
        let delList = [`${releaseDir}/**`, releaseDir + "_pack"];
        await del(delList, { force: false })
    }

    private async build() {
        const spinner = ora('Loading unicorns');
        spinner.color = 'green';
        spinner.text = chalk.red('正在编译中...');
        spinner.start()
        console.time(`[${chalk.yellowBright(this.program.opts().platform)}]发布文件编译完成`)
        let projPath = this.workspace;
        let platform = this.program.opts().platform;
        let outPath = `${projPath}/release/${platform}/js/bundle.js`
        await esbuild.build({
            define: { VERSION: '2' },
            entryPoints: [`${projPath}/src/Main.ts`],
            bundle: true,
            minify: false,
            keepNames: false,
            sourcemap: false,
            write: true,
            format: 'iife',
            treeShaking: true,
            outfile: outPath
        }).then((value: any) => {
            spinner.stop()
            console.timeEnd(`[${chalk.yellowBright(this.program.opts().platform)}]发布文件编译完成`)
        })
    }

    private async copyFile() {
        return new Promise((resolve) => {
            console.time(chalk.blue("开始拷贝"))
            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let releaseDir = projPath + "/release/" + platform;
            let baseCopyFilter = [`${projPath}/bin/**/*.*`, `!${projPath}/bin/indexmodule.html`, `!${projPath}/bin/import/*.*`, `!${projPath}/bin/js/*.*`];

            var stream = gulp.src(baseCopyFilter, { base: `${projPath}/bin` });
            stream.pipe(gulp.dest(releaseDir)).on('finish', (err: any) => {
                console.timeEnd(chalk.blue("开始拷贝"))
                resolve(null)
            });

        })

    }

    private async compressJs() {
        console.time("压缩JS文件")
        const spinner = ora('Loading unicorns');
        spinner.color = 'yellow';
        spinner.text = chalk.red('正在压缩中...');
        spinner.start()
        let projPath = this.workspace;
        let platform = this.program.opts().platform;
        let releaseDir = projPath + "/release/" + platform;
        let compressJsFilter = [releaseDir + "/**/*.js", `!${releaseDir}/libs/min/**/*.js`];
        let options = {
            mangle: {
                keep_fnames: true
            }
        }

        // console.log("compressJsFilter: ", compressJsFilter);
        return gulp.src(compressJsFilter, { base: releaseDir })
            .pipe(uglify(options))
            .on('error', function (err: any) {
                console.warn(err.toString());
            })
            .pipe(gulp.dest(releaseDir))
            .on('finish', function (err: any) {
                spinner.stop()
                console.timeEnd("压缩JS文件")
            });
    }
}