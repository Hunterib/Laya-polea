import { buildConfig, getLocalIp, getNanoSecTime, pluginsCommand } from ".";

import path from "path";
import chalk from "chalk";
import cprocess from "child_process";
import ora from "ora";
import { build, BuildOptions, BuildResult, buildSync, serve, ServeResult } from "esbuild";

/** 编译ts代码 */
export class BundlePlugin extends pluginsCommand {
	protected name: string = "代码编译";
	private config: buildConfig;
	constructor(config: buildConfig) {
		super();
		// this.spinner = ora({ text: "Loading unicorns", spinner: "boxBounce2" });
		this.config = config;
		if (!config.outDir) {
			this.config.outDir = "./bin/";
		}
		if (!config.outfile) {
			this.config.outfile = "./js/bundle.js";
		}
	}
	async execute() {
		// this.spinner?.start("代码编译中....");
		let buildConfig: BuildOptions = {
			entryPoints: this.config.entry || ["./src/Main.ts"],
			define: this.config.define || {},
			bundle: false,
			minify: this.config.minify || false,
			keepNames: false,
			sourcemap: this.config.sourcemap || true,
			absWorkingDir: "/Users/hums/Git/laya-cli/" || process.cwd(),
			nodePaths: ["/Users/hums/Git/laya-cli/"],
			splitting: false,
			target: ["es2020", "chrome58", "firefox57", "safari11", "edge16", "node12"],
			write: this.config.write || true,
			format: "iife", //"iife",'iife' | 'cjs' | 'esm';
			pure: this.config.pure || [],
			treeShaking: true,
			metafile: true,
			globalName: this.config.globalName || "polec",
			loader: { ".glsl": "text", ".vs": "text", ".fs": "text" },
			plugins: this.config.plugins || [],
		};
		console.log("+++++", __dirname);

		if (this.config.watch && this.config.watch == true) {
			buildConfig.watch = {
				onRebuild: (error, result) => {
					if (error) {
						console.error("watch build failed:", error);
						// this.spinner.fail("watch rebuild fail");
					} else {
						// this.spinner.succeed("watch rebuild succeeded");
					}
				},
			};
		}

		console.log("||||", process.cwd());

		if (buildConfig.entryPoints.length === 1) {
			buildConfig.outfile = path.resolve(this.config.outDir, this.config.outfile);
		} else {
			buildConfig.outdir = this.config.outDir;
		}

		let serveOptions: any = null;

		if (this.config.server) {
			if (!this.config.server.servedir) {
				this.config.server.servedir = this.config.outDir;
			}
			serveOptions = this.config.server;
		}

		await build(buildConfig);

		// return new Promise((resolve, reject) => {
		// 	if (!serveOptions) {
		// 		console.log(22);
		// 		build(buildConfig)
		// 			.then((buildResult: BuildResult) => {
		// 				console.log(buildResult);
		// 				this.spinner.succeed("编译完成: " + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
		// 				resolve(null);
		// 			})
		// 			.catch((reason: any) => {
		// 				this.spinner.fail("编译失败: " + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
		// 				// process.exit(-1);
		// 				reject(null);
		// 			});
		// 	} else {
		// 		serve(serveOptions, buildConfig).then((serveResult: ServeResult) => {
		// 			let uri: string = `http://${getLocalIp()}:${serveResult.port}`;
		// 			this.spinner.succeed("编译完成:\n " + `url ${chalk.green(uri)}`);
		// 			if (!serveOptions.open && serveOptions.open == false) {
		// 				resolve(serveResult);
		// 				return;
		// 			}
		// 			let cmd = "linux";
		// 			switch (process.platform) {
		// 				case "win32":
		// 					cmd = "start";
		// 					break;
		// 				case "linux":
		// 					cmd = "xdg-open";
		// 					break;
		// 				case "darwin":
		// 					cmd = "open";
		// 					break;
		// 			}
		// 			cprocess.exec(`${cmd} ${uri}`);
		// 			resolve(serveResult);
		// 		});
		// 	}
		// });
	}
}
