import { build, PluginBuild, Plugin, OnLoadArgs, BuildOptions } from "esbuild";
import { readFileSync } from "fs";
import { NodeVM, VMScript } from "vm2";
import path from "path";

//编译配置文件并输出
export async function bundleConfig(projectPath: string) {
	let buildConfig: BuildOptions = {
		entryPoints: [projectPath + "/" + ".laya-cli/config.ts"],
		outfile: __dirname + "/../config.js",
		write: false,
		platform: "node",
		bundle: true,
		target: ["node12"],
		incremental: true,
		metafile: true,
		format: "cjs",
		loader: { ".ts": "ts" },
		// plugins: [ts2jsPlugin],
	}
	const result = await build(buildConfig);
	const { text } = result.outputFiles[0];
	const vm = new NodeVM({
		require: {
			builtin: ["*"],
			external: true,
			root: [__dirname]
		},
	});
	const script = new VMScript(text);
	
	return await vm.run(script).default;
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
