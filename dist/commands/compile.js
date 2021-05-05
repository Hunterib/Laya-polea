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
const command_1 = require("../command");
const config_1 = require("../tool/config");
const esbuild_1 = require("esbuild");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = __importDefault(require("child_process"));
const Utils_1 = require("../tool/Utils");
const net_1 = require("../tool/net");
class Compile extends command_1.command {
    onConstruct() {
        this.program.description(chalk_1.default.green("开始编译项目"));
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            this.spinner.start("开始编译");
            let cmg = yield config_1.bundleConfig(this.workspace);
            this.config = cmg.buildConfig({ command: "compile" });
            this.spinner.succeed(`获取配置: ${chalk_1.default.blueBright("Run buildConfig")}`);
            if (this.config.plugins && this.config.plugins.length > 0) {
                yield this.config.plugins[0].onRun();
            }
            let define = this.config.define || {};
            let entryPoints = this.config.entry || [`./src/Main.ts`];
            let splitting = false;
            let buildConfig = {
                entryPoints: entryPoints,
                define: define,
                bundle: true,
                minify: false,
                keepNames: false,
                sourcemap: true,
                absWorkingDir: process.cwd(),
                splitting: splitting,
                target: ["es2020", "chrome58", "firefox57", "safari11", "edge16", "node12"],
                write: true,
                format: "iife",
                pure: this.config.pure || [],
                treeShaking: true,
                metafile: true,
                globalName: "ibs",
                loader: { ".glsl": "text", ".vs": "text", ".fs": "text" },
            };
            if (this.config.watch && this.config.watch == true) {
                buildConfig.watch = {
                    onRebuild: (error, result) => {
                        if (error) {
                            console.error("watch build failed:", error);
                            this.spinner.fail("watch rebuild fail");
                        }
                        else {
                            this.spinner.succeed("watch rebuild succeeded");
                        }
                    },
                };
            }
            if (entryPoints.length === 1) {
                buildConfig.outfile = this.config.outputDir + this.config.outfile;
            }
            else {
                buildConfig.outdir = this.config.outputDir;
            }
            if (this.config.server) {
                if (!this.config.server.servedir) {
                    this.config.server.servedir = "./bin";
                }
                if (!this.config.server.open)
                    this.server(this.config.server, buildConfig);
            }
            else {
                this.build(buildConfig);
            }
        });
    }
    //编译代码
    build(buildConfig) {
        esbuild_1.build(buildConfig)
            .then((buildResult) => {
            this.spinner.succeed("编译完成: " + `${chalk_1.default.green(`${Utils_1.getNanoSecTime(this.stime)}`)}`);
            if (!this.config) {
                process.exit();
            }
        })
            .catch((reason) => {
            console.error(reason);
            this.spinner.fail("编译失败: " + `${chalk_1.default.green(`${Utils_1.getNanoSecTime(this.stime)}`)}`);
            process.exit(-1);
        });
    }
    //服务器运行
    server(serveOptions, buildConfig, isOpen = false) {
        esbuild_1.serve(serveOptions, buildConfig).then((serveResult) => {
            let uri = `http://${net_1.getLocalIp()}:${serveResult.port}`;
            this.spinner.succeed("编译完成:\n " + `url ${chalk_1.default.green(uri)}`);
            if (!serveOptions.open && serveOptions.open == false)
                return;
            let cmd = "linux";
            switch (process.platform) {
                case "win32":
                    cmd = "start";
                    break;
                case "linux":
                    cmd = "xdg-open";
                    break;
                case "darwin":
                    cmd = "open";
                    break;
            }
            child_process_1.default.exec(`${cmd} ${uri}`);
        });
    }
}
exports.default = Compile;
