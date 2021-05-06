import chalk from "chalk";
import { build, BuildOptions, BuildResult, OnLoadArgs, OnResolveArgs, Plugin, PluginBuild } from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { NodeVM, VMScript } from "vm2";
import { UserConfig } from "../polec";
import { command } from "../command";

export class task extends command {
	protected onConstruct(): void {
		this.program.description(chalk.green("自定义命令"));
	}

	async execute() {
		// let projectPath = this.workspace;
		// let code = readFileSync(projectPath + "/" + ".laya-cli/config.polec.ts").toString();
		// let result = require('esbuild').buildSync({
		// 	stdin: {
		// 		contents: code,
		// 		// These are all optional:
		// 		resolveDir: require('path').join(__dirname, 'src'),
		// 		sourcefile: 'imaginary-file.js',
		// 		loader: 'ts',
		// 	},
		// 	bundle: true,
		// 	format: 'esm',
		// 	write: false,
		// })
		// console.log(result.outputFiles[0].text)
		console.time("编译配置文件")
		let projectPath = this.workspace;
		console.log(projectPath)
		let buildConfig: BuildOptions = {
			entryPoints: [projectPath + "/" + ".laya-cli/config.polec.ts"],
			outfile: path.resolve(__dirname, "../config.polec.js"),
			write: true,
			platform: "node",
			bundle: true,
			banner: { js: 'var polec = require("./polec");' },
			target: ["node12"],
			incremental: true,
			metafile: true,
			format: "cjs",
			loader: { ".ts": "ts" },
			plugins: [ts2jsPlugin]
		}

		const result = await build(buildConfig);
		let bconf = require(buildConfig.outfile).default
		console.log(buildConfig.outfile, "===", bconf)
		console.timeEnd("编译配置文件")
		let config: UserConfig = bconf.buildConfig()
		if (config.plugins.length > 0) {
			await config.plugins[0].execute()
		}



		// build(buildConfig).then((value: BuildResult) => {
		// 	process.exit();
		// });
		// console.log(result.metafile.outputs)
		// const { text } = result.outputFiles[0];
		// console.log(text)
		// const vm = new NodeVM({
		// 	require: {
		// 		builtin: ["*"],
		// 		external: true,
		// 		root: [__dirname]
		// 	},
		// });
		// const script = new VMScript(text);
		// console.log( vm.run(script))
		// return await vm.run(script).default;


		process.exit();
	}
}

let ts2jsPlugin: Plugin = {
	name: "ts2js",
	setup(build: PluginBuild) {
		build.onResolve({ filter: /.ts/g }, (args: OnResolveArgs) => {
			console.log("==|=", args)
			return {}
		})
		// build.onLoad({ filter: /.ts/g }, (args: OnLoadArgs) => {
		// 	let conter = readFileSync(args.path).toString();
		// 	console.log(conter);
		// 	let code = conter
		// 	// 	.replace(/built-in/g, `${path.resolve(__dirname, "../", "built-in", "./index")}`)
		// 	// 	.replace(/: ConfigManager/g, "")
		// 	// 	.replace(/:ConfigManager/g, "")
		// 	// 	.replace(/: ConfigCommand/g, "")
		// 	// 	.replace(/:ConfigCommand/g, "")
		// 	// 	.replace(/: UserConfig/g, "")
		// 	// 	.replace(/:UserConfig/g, "")
		// 	// 	.replace(/implements plugins.Command/g, "");
		// 	return { contents: code };
		// });
	},
};
