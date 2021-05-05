"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const del_1 = __importDefault(require("del"));
const gulp_1 = __importDefault(require("gulp"));
const uglify = require("gulp-uglify-es").default;
const jsonminify = require("gulp-jsonminify");
const rev = require("gulp-rev");
const revdel = require("gulp-rev-delete-original");
const command_1 = require("../command");
const esbuild_1 = __importDefault(require("esbuild"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
class publish extends command_1.command {
    onConstruct() {
        this.program.description(chalk_1.default.green("发布项目"));
        this.program.option("-p, --platform <mode>", "发布平台[web]", "web");
        this.program.option("-v, --version <mode>", "发布平台[web]");
        this.program.option("-m, --minify <mode>", "压缩JS文件", true);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clearReleaseDir();
            yield this.copyFile();
            yield this.build();
            if (this.program.opts().minify == true || this.program.opts().minify == "true") {
                yield this.compressJs();
                yield this.compressJson();
                yield this.version1();
            }
        });
    }
    clearReleaseDir() {
        return __awaiter(this, void 0, void 0, function* () {
            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let releaseDir = projPath + "/release/" + platform;
            let delList = [`${releaseDir}/**`, releaseDir + "_pack"];
            yield del_1.default(delList, { force: false });
        });
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            const spinner = ora_1.default("Loading unicorns");
            spinner.color = "green";
            spinner.text = chalk_1.default.red("正在编译中...");
            spinner.start();
            console.time(`[${chalk_1.default.yellowBright(this.program.opts().platform)}]发布文件编译完成`);
            let projPath = this.workspace;
            let platform = this.program.opts().platform;
            let outPath = `${projPath}/release/${platform}/js/bundle.js`;
            yield esbuild_1.default
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
                .then((value) => {
                spinner.stop();
                console.timeEnd(`[${chalk_1.default.yellowBright(this.program.opts().platform)}]发布文件编译完成`);
            });
        });
    }
    copyFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                console.time(chalk_1.default.blue("开始拷贝"));
                let projPath = this.workspace;
                let platform = this.program.opts().platform;
                let releaseDir = projPath + "/release/" + platform;
                let baseCopyFilter = [`${projPath}/bin/**/*.*`, `!${projPath}/bin/indexmodule.html`, `!${projPath}/bin/import/*.*`, `!${projPath}/bin/js/*.*`];
                let stream = gulp_1.default.src(baseCopyFilter, { base: `${projPath}/bin` });
                stream.pipe(gulp_1.default.dest(releaseDir)).on("finish", (err) => {
                    console.timeEnd(chalk_1.default.blue("开始拷贝"));
                    resolve(null);
                });
            });
        });
    }
    compressJs() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                console.time("压缩JS文件");
                const spinner = ora_1.default("Loading unicorns");
                spinner.color = "yellow";
                spinner.text = chalk_1.default.red("正在压缩中...");
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
                gulp_1.default.src(compressJsFilter, { base: releaseDir })
                    .pipe(uglify(options))
                    .on("error", function (err) {
                    console.warn(err.toString());
                })
                    .pipe(gulp_1.default.dest(releaseDir))
                    .on("finish", function (err) {
                    spinner.stop();
                    console.timeEnd("压缩JS文件");
                    resolve();
                });
            });
        });
    }
    compressJson() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                console.time("压缩JSON文件");
                const spinner = ora_1.default("Loading unicorns");
                spinner.color = "yellow";
                spinner.text = chalk_1.default.red("正在压缩JSON中...");
                spinner.start();
                let projPath = this.workspace;
                let platform = this.program.opts().platform;
                let releaseDir = projPath + "/release/" + platform;
                console.log(releaseDir);
                gulp_1.default.src([releaseDir + "/**/*.{json,atlas}"], { base: releaseDir })
                    .pipe(jsonminify())
                    .pipe(gulp_1.default.dest(releaseDir))
                    .on("finish", function (err) {
                    spinner.stop();
                    console.timeEnd("压缩JSON文件");
                    resolve();
                });
            });
        });
    }
    version1() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                console.time("生成版本管理json");
                const spinner = ora_1.default("Loading unicorns");
                spinner.color = "yellow";
                spinner.text = chalk_1.default.red("正在压缩JSON中...");
                spinner.start();
                let projPath = this.workspace;
                let platform = this.program.opts().platform;
                let releaseDir = projPath + "/release/" + platform;
                let config = [`${releaseDir}/**/*.*`, `!${releaseDir}/*.html`, `!${releaseDir}/{version.json,game.js,game.json,project.config.json,weapp-adapter.js,project.swan.json,swan-game-adapter.js,main.js,gameConfig.json,my-adapter.js,microgame-adapter.js,qg-adapter.js,huawei-adapter.js,adapter.js,}`, `!${releaseDir}/layaforqq/**/*.*`];
                gulp_1.default.src(config, { base: releaseDir })
                    .pipe(rev())
                    .pipe(gulp_1.default.dest(releaseDir))
                    .pipe(revdel())
                    .pipe(rev.manifest("version.json"))
                    .pipe(gulp_1.default.dest(releaseDir))
                    .on("finish", function (err) {
                    spinner.stop();
                    console.timeEnd("生成版本管理json");
                    resolve();
                });
            });
        });
    }
}
exports.default = publish;
