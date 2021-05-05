"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var pjson = require("../package.json");
const program = new commander_1.Command();
program.version(pjson.version, "-v, --version", chalk_1.default.green("当前工具的版本号！"));
program.helpOption("-h, --help", chalk_1.default.green("工具的帮助"));
program.addHelpCommand("help [cmd]", chalk_1.default.green("命令的帮助 [cmd]"));
var dir = __dirname + "/commands";
fs_1.default.readdirSync(dir).forEach((file) => {
    const pathname = path_1.default.join(dir, file);
    if (!fs_1.default.statSync(pathname).isDirectory()) {
        let cmd = require(pathname);
        for (const key in cmd) {
            new cmd[key](program);
        }
    }
});
program.parse(process.argv);
