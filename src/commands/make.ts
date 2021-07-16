import cprocess from "child_process";
import readline from "readline";
var os = require("os");
import fs from "fs";
import { CopyPlugin, FileUtile, getNanoSecTime } from "../builtin";
import del from "del";
import { command } from "../command";
import chalk from "chalk";
import globby from "globby";
import path from "path";
var pjson = require("../../package.json");

export class make extends command {
    private output: string = "./template/";
    protected onConstruct(): void {
        this.program.description(chalk.green("构建cli工具"));
    }
    protected async execute() {
        this.spinner.start("cli构建中....");
        let cpf = cprocess.exec(`node_modules/.bin/tsc -d -p ./src/builtin/ --outFile ${this.output}temp/api.js`);
        cpf.on("close", () => this.handlerDTSCode());
    }

    private async handlerDTSCode() {
        let fWrite = fs.createWriteStream(`${this.output}api.d.ts`);
        let fReads = fs.createReadStream(`${this.output}temp/api.d.ts`);
        del(`${this.output}temp/`);

        let rl = readline.createInterface({ input: fReads });
        let index = 1;
        rl.on("line", line => {
            let str = null;
            if (/(export|import).*?from/.test(line)) {
            } else if (/(declare|module).*?".*?"/.test(line)) {
                str = line.replace(/".*?"/, pjson.name);
            } else if (/: Stats/.test(line)) {
                str = line.replace(/: Stats/, ": any");
            } else if (/types="node"/.test(line)) {
                str = line.replace(/types="node"/, 'types="./node"');
            } else {
                str = line;
            }
            if (str) {
                fWrite.write(`${str.replace("unknown", "void") + os.EOL}`); // 下一行
                index++;
            }
        });
        rl.on("close", async () => {
            await this.del()
        });
    }

    private async del() {
        await del(["./release/**"]);
        let resule = await globby(["./bin/**/*.*",
            "./lib/**/**",
            "./template/**/*.*",
            "./{package.json,.prettierrc,README.md}",
            "!./lib/config.*.*"])

        let topath = "[path][name][ext]"
        await Promise.all(
            resule.map(async filepath => {
                let fromFilename = path.resolve("./", filepath);
                const name = path.basename(filepath, path.extname(filepath));
                const extname = path.extname(filepath).substr(1);
                let p = path.dirname(path.join("./release/", filepath)) + "/";
                const toFilename = topath.replace("[name]", name).replace("[ext]", extname == "" ? "" : "." + extname).replace("[path]", p);
                FileUtile.copy(fromFilename, toFilename);
            })
        );

        let fromPath: string = path.resolve(__dirname + "./../../", "libs");
        let toPath: string = path.resolve(__dirname + "./../../", "release/libs");
        cprocess.spawn('cp', ['-r', fromPath, toPath]);
        this.spinner.succeed("构建完成：" + getNanoSecTime(this.stime));
    }
}
