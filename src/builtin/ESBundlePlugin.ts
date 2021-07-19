import { buildConfig, ConfigManager, getLocalIp, getNanoSecTime, out_config, pluginsCommand, run } from ".";
import chokidar from "chokidar";
import path from "path";
import chalk from "chalk";
import cprocess from "child_process";
import { build, BuildOptions, BuildResult, serve, ServeResult } from "esbuild";

/** 编译ts代码 */
export class ESBundlePlugin extends pluginsCommand {
    public name: string = "esbuild-bundle-plugin";
    private config: buildConfig;
    private esb: BuildResult = null;
    constructor(config?: buildConfig) {
        super();
        this.config = config || {};

        if (!config.outfile) {
            this.config.outfile = "./js/bundle.js";
        }

        if (this.config.sourcemap == undefined || this.config.sourcemap == null) {
            this.config.sourcemap = true;
        }

        let define: any = {};
        if (this.config.define) {
            for (const key in this.config.define) {
                if (typeof this.config.define[key] == "string") {
                    define[key] = `"${String(this.config.define[key])}"`;
                } else {
                    define[key] = this.config.define[key];
                }
            }
        }
        this.config.define = define;
    }
    private wait(time: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(null)
            }, time);
        })
    }
    async execute() {
        super.execute(arguments);

        if (this.UserConfig.define) {
            for (const key in this.UserConfig.define) {
                if (typeof this.UserConfig.define[key] == "string") {
                    this.config.define[key] = `"${String(this.UserConfig.define[key])}"`;
                } else {
                    this.config.define[key] = this.UserConfig.define[key];
                }
            }
        }

        this.spinner.start("代码编译中....");
        let buildConfig: BuildOptions = {
            entryPoints: this.config.entry || ["./src/Main.ts"],
            define: this.config.define || {},
            bundle: true,
            minify: this.config.minify || false,
            keepNames: false,
            sourcemap: this.config.sourcemap,
            absWorkingDir: process.cwd(),
            // nodePaths: ["/Users/hums/Git/laya-cli/"],
            splitting: false,
            target: ["es2020", "chrome58", "firefox57", "safari11", "edge16", "node12"],
            write: this.config.write || true,
            format: "iife", //"iife",'iife' | 'cjs' | 'esm';
            pure: this.config.pure || [],
            treeShaking: true,
            metafile: true,
            globalName: this.config.globalName || "polea",
            loader: { ".glsl": "text", ".vs": "text", ".fs": "text" },
            plugins: this.config.plugins || [],
        };



        if (this.config.watch && this.config.watch == true || this.watch) {
            buildConfig.watch = {
                onRebuild: async (error, result) => {
                    if (error) {
                        console.error("watch build failed:", error);
                        this.spinner.fail("watch rebuild fail");
                    } else {
                        this.esb = result;
                        console.log(`${chalk.magentaBright(`\nCode Watch`)}`)
                        await this.wait(1)

                        for (const iterator of this.srcPaths) {
                            let item = iterator.split("|")
                            let event = item[0]
                            let _path = item[1]
                            console.log(`${chalk.blueBright("  |-") + chalk.greenBright(`${event}`)}`, `${chalk.blackBright(_path.replace(path.join(this.workspace, "../"), "~/"))}`)
                        }
                        if (run.Plugin == null || run.Plugin == this.name) {
                            console.log(`${chalk.blueBright("  |-") + chalk.cyanBright(`开始编译代码：`)}`)
                            this.spinner.succeed(`${chalk.blueBright("[✔]")}rebuild succeeded!`);
                        }
                        this.srcPaths = [];
                        console.log(`${chalk.magentaBright(`Code Watch End! `)}`)
                    }
                },
            };
        }

        if (buildConfig.entryPoints.length === 1) {
            buildConfig.outfile = path.resolve(this.output, this.config.outfile);
        } else {
            buildConfig.outdir = this.output;
        }

        let serveOptions: any = null;

        if (this.config.server) {
            if (!this.config.server.servedir) {
                this.config.server.servedir = this.output;
            }
            serveOptions = this.config.server;
        }

        return new Promise((resolve, reject) => {
            if (!serveOptions) {
                build(buildConfig)
                    .then((buildResult: BuildResult) => {
                        this.esb = buildResult;
                        if (this.watch) {
                            this.spinner.succeed("代码编译完成");
                        } else {
                            this.spinner.succeed("代码编译完成: " + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
                        }
                        resolve(buildResult);
                    })
                    .catch((reason: any) => {
                        this.spinner.fail("编译失败: " + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
                        // process.exit(-1);
                        reject(null);
                    });

            } else {
                serve(serveOptions, buildConfig).then((serveResult: ServeResult) => {
                    let uri: string = `http://${getLocalIp()}:${serveResult.port}`;
                    this.spinner.succeed("编译完成:\n " + `url ${chalk.green(uri)}`);
                    if (!serveOptions.open && serveOptions.open == false) {
                        resolve(serveResult);
                        return;
                    }
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
                    cprocess.exec(`${cmd} ${uri}`);
                    resolve(serveResult);
                });
            }
        });
    }

    private srcPaths: Array<string> = [];
    public async runWatch() {
        let projPath = this.workspace;

        var srcWatcher = chokidar.watch([path.join(projPath, "src")], {
            ignoreInitial: true,
            ignored: /.map/
            // cwd:this.output
        });

        srcWatcher.on("all", (event, _path, details) => {
            if (run.Plugin != null && run.Plugin != this.name) {
                return
            }

            if (this.srcPaths.indexOf(event + "|" + _path) == -1) {
                this.srcPaths.push(event + "|" + _path);
            }
            // console.log(`${chalk.blueBright(" |-") + chalk.greenBright(`${event}`)}`, `${chalk.blackBright(_path.replace(path.join(projPath, "../"), "~/"))}`)
        })

        //path.join(projPath, "src"),
        var watcher = chokidar.watch([path.join(projPath, ".polea")], {
            ignoreInitial: true,
            ignored: /.map/
            // cwd:this.output
        });

        let tt: any = null;
        let isConfig = false;
        watcher.on("all", (event, _path, details) => {
            if (run.Plugin != null && run.Plugin != this.name) {
                return
            }
            if (tt == null) {
                this.stime = process.hrtime.bigint();
                console.log(`${chalk.magentaBright(`\nCode Watch`)}`)
            }
            clearTimeout(tt);
            if (_path.indexOf(".polea")) {
                isConfig = true
            }
            console.log(`${chalk.blueBright(" |-") + chalk.greenBright(`${event}`)}`, `${chalk.blackBright(_path.replace(path.join(projPath, "../"), "~/"))}`)
            tt = setTimeout(async () => {
                clearTimeout(tt);
                tt = null;
                if (isConfig == true) {
                    isConfig = false;
                    let bconf: ConfigManager = require(out_config(this.workspace, this.platform)).default;
                    this.UserConfig = bconf.buildConfig({ command: this.command });
                }
                this.esb && this.esb.stop()
                await this.execute();
                run.Plugin = null;
                console.log(`${chalk.magentaBright(`Code Watch End! `)}` + chalk.green(getNanoSecTime(this.stime)))
            }, 2)
        })
    }
}

