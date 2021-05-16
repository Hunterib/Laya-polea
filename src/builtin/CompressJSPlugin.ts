import chalk from "chalk";
import { build } from "esbuild";
import globby from "globby";
import ora from "ora";
import pLimit from "p-limit";
import path from "path";
import { getNanoSecTime, Matcher, pluginsCommand } from ".";

import crypto from "crypto";
import crc from "crc";

export class CompressJSPlugin extends pluginsCommand {
    constructor(private hash: "crc32" | "md5", private matchers: Matcher[], private clean: boolean = false) {
        super();
        this.spinner = ora({ text: "Loading unicorns", spinner: "boxBounce2" });
    }
    async execute() {
        super.execute(arguments);
        this.spinner.start("开始拷贝....");

        try {
            const limit = pLimit(100); // 5 表示每次发送5个请求
            await Promise.all(
                this.matchers.map(item =>
                    limit(async () => {
                        await this.runPattern(item);
                    })
                )
            );
            this.spinner.succeed("拷贝完成：" + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
        } catch (error) {
            this.spinner.succeed("拷贝失败：" + JSON.stringify(error));
        }
    }

    private async runPattern(item: Matcher) {
        let resule = await globby(item.from, {
            baseNameMatch: false,
            cwd: path.resolve(process.cwd(), item.base),
            dot: true,
            ignore: ["*/.DS_Store"],
        });

        let result = await build({
            entryPoints: resule,
            outdir: path.resolve(process.cwd(), "assets"),
            minify: false,
            treeShaking: true,
            // chunkNames: "chunks/[name]-[hash]",
            // splitting: true,
            // format: "esm",
            metafile: true,
            color: false,
            legalComments: "none",
            logLevel: "error",
            write: false,
        });

        result.outputFiles.map(obk => {
            let contentHash = crypto.createHash("md5").update(obk.contents).digest("hex");
            console.log(contentHash, obk.path);
        });
    }
}
