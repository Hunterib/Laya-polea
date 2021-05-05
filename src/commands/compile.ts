import { command } from "../command";
import { bundleConfig } from "../tool/config";
import { build, BuildOptions, BuildResult, serve, ServeResult } from "esbuild";
import chalk from "chalk";
import cprocess from "child_process";
import { getNanoSecTime } from "../tool/Utils";
import { getLocalIp } from "../tool/net";
import { ConfigManager, DevServer, UserConfig } from "../built-in/api";

export default class Compile extends command {
	protected config: UserConfig;
	protected onConstruct() {
		this.program.description(chalk.green("开始编译项目"));
	}

	async execute() {
		this.spinner.start("开始编译");

		let cmg: ConfigManager = await bundleConfig(this.workspace);
		this.config = cmg.buildConfig({ command: "compile" });
		this.spinner.succeed(`获取配置: ${chalk.blueBright("Run buildConfig")}`);
		if (this.config.plugins && this.config.plugins.length > 0) {
			await this.config.plugins[0].onRun();
		}

		let define = this.config.define || {};
		let entryPoints: Array<string> = this.config.entry || [`./src/Main.ts`];
		let splitting = false;

		let buildConfig: BuildOptions = {
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
			format: "iife", //"iife",'iife' | 'cjs' | 'esm';
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
					} else {
						this.spinner.succeed("watch rebuild succeeded");
					}
				},
			};
		}
		if (entryPoints.length === 1) {
			buildConfig.outfile = this.config.outputDir + this.config.outfile;
		} else {
			buildConfig.outdir = this.config.outputDir;
		}

		if (this.config.server) {
			if (!this.config.server.servedir) {
				this.config.server.servedir = "./bin";
			}
			if (!this.config.server.open) this.server(this.config.server, buildConfig);
		} else {
			this.build(buildConfig);
		}
	}

	//编译代码
	public build(buildConfig: BuildOptions) {
		build(buildConfig)
			.then((buildResult: BuildResult) => {
				this.spinner.succeed("编译完成: " + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
				if (!this.config) {
					process.exit();
				}
			})
			.catch((reason: any) => {
				console.error(reason);
				this.spinner.fail("编译失败: " + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
				process.exit(-1);
			});
	}

	//服务器运行
	private server(serveOptions: DevServer, buildConfig: BuildOptions, isOpen: boolean = false) {
		serve(serveOptions, buildConfig).then((serveResult: ServeResult) => {
			let uri: string = `http://${getLocalIp()}:${serveResult.port}`;
			this.spinner.succeed("编译完成:\n " + `url ${chalk.green(uri)}`);
			if (!serveOptions.open && serveOptions.open == false) return;
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
		});
	}
}
