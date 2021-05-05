import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import path from "path";

var pjson = require("../package.json");

const program = new Command();
program.version(pjson.version, "-v, --version", chalk.green("当前工具的版本号！"));
program.helpOption("-h, --help", chalk.green("工具的帮助"));
program.addHelpCommand("help [cmd]", chalk.green("命令的帮助 [cmd]"));

var dir = __dirname + "/commands";
fs.readdirSync(dir).forEach((file: any) => {
	const pathname = path.join(dir, file);
	if (!fs.statSync(pathname).isDirectory()) {
		let cmd = require(pathname);
		for (const key in cmd) {
			new cmd[key](program);
		}
	}
});
program.parse(process.argv);
