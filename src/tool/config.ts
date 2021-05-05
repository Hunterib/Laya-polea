import { build, PluginBuild, Plugin, OnLoadArgs, BuildOptions } from "esbuild";
import { readFileSync } from "fs";
import { NodeVM, VMScript } from "vm2";
import path from "path";

//编译配置文件并输出
export async function bundleConfig(projectPath: string) {
	// {
	// 	entryPoints: [projectPath + "/" + ".laya-cli/config.ts"],
	// 	outfile: __dirname + "/../config.js",
	// 	write: false,
	// 	platform: "node",
	// 	bundle: true,
	// 	target: ["node12"],
	// 	incremental: true,
	// 	metafile: true,
	// 	format: "cjs",
	// 	loader: { ".ts": "ts" },
	// 	plugins: [ts2jsPlugin],
	// }
	let buildConfig: BuildOptions = {
		entryPoints: [projectPath + "/" + ".laya-cli/config.ts"],
		define: {},
		bundle: true,
		minify: false,
		keepNames: false,
		sourcemap: false,
		absWorkingDir: "/Users/hums/Git/laya-cli/" || process.cwd(),
		nodePaths: ["/Users/hums/Git/laya-cli/"],
		splitting: false,
		platform: "node",
		// target: ["es2020", "chrome58", "firefox57", "safari11", "edge16", "node12"],
		write: false,
		format: "cjs", //"iife",'iife' | 'cjs' | 'esm';
		pure: [],
		treeShaking: true,
		metafile: true,
		loader: { ".glsl": "text", ".vs": "text", ".fs": "text" },
		plugins: [ts2jsPlugin],
	};
	const result = await build(buildConfig);

	// console.log(require(__dirname + "/../config"));

	// console.log(readFileSync(__dirname + "/../config").toString());
	const { text } = result.outputFiles[0];
	console.log(text);
	const vm = new NodeVM({
		require: {
			// context: "sandbox",
			builtin: ["*"],
			// import: [__dirname + "../../"],
			external: false,

			root: [__dirname],
			resolve: (o, n) => {
				console.log(o, n);
				return "";
			},
		},
	});
	const script = new VMScript(text);
	return await vm.run(script).default;
	// return require(__dirname + "/../config").default;
}

let ts2jsPlugin: Plugin = {
	name: "ts2js",
	setup(build: PluginBuild) {
		build.onLoad({ filter: /.ts/g }, (args: OnLoadArgs) => {
			let conter = readFileSync(args.path).toString();
			// console.log(conter);
			let code = conter
				.replace(/built-in/g, `${path.resolve(__dirname, "../", "built-in")}`)
				.replace(/: ConfigManager/g, "")
				.replace(/:ConfigManager/g, "")
				.replace(/: ConfigCommand/g, "")
				.replace(/:ConfigCommand/g, "")
				.replace(/: UserConfig/g, "")
				.replace(/:UserConfig/g, "")
				.replace(/implements plugins.Command/g, "");
			return { contents: code };
		});
	},
};
