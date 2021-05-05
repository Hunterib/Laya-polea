import { build, PluginBuild, Plugin, OnLoadArgs } from "esbuild";
import { readFileSync } from "fs";
import { NodeVM, VMScript } from "vm2";
import path from "path";

//编译配置文件并输出
export async function bundleConfig(projectPath: string) {
	const result = await build({
		entryPoints: [projectPath + "/" + ".laya-cli/config.ts"],
		outfile: __dirname + "/../config.js",
		write: false,
		platform: "node",
		bundle: true,
		target: ["es2020", "chrome58", "firefox57", "safari11", "edge16", "node12"],
		incremental: false,
		format: "cjs",
		plugins: [ts2jsPlugin],
	});
	const { text } = result.outputFiles[0];
	const vm = new NodeVM();
	const script = new VMScript(text);
	return await vm.run(script).default;
}

let ts2jsPlugin: Plugin = {
	name: "ts2js",
	setup(build: PluginBuild) {
		build.onLoad({ filter: /.ts/g }, (args: OnLoadArgs) => {
			let conter = readFileSync(args.path).toString();
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
