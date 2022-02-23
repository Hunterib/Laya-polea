import chalk from "chalk";
import globby from "globby";
import pLimit from "p-limit";
import path from "path";
import { getHash, getNanoSecTime, Matcher, pluginsCommand } from ".";

import crypto from "crypto";
import crc from "crc";
import { FileUtile } from "../tool/FileUtil";
import { readFileSync, renameSync } from "fs";


export class ManifestPlugin extends pluginsCommand {
    public name: string = "manifest-plugin";
    private manifest: any = {};

    /**
     *
     * @param hash "crc32" | "md5" 拷贝重命名方式
     * @param matchers 匹配文件路径规则
     * @param clean 拷贝后是否删除
     */
    constructor(private hash: "crc32" | "md5", private matchers: Matcher[], private file: string) {
        super();
        this.manifest = {}
    }

    private isRename: boolean = false;

    async execute() {
        super.execute(arguments);
        this.spinner.start("开始获取" + this.hash + "....");

        try {
            const limit = pLimit(100); // 5 表示每次发送5个请求
            await Promise.all(
                this.matchers.map(item =>
                    limit(async () => {
                        await this.runPattern(item);
                    })
                )
            );
            // console.log(path.join(this.output, this.file))
            await FileUtile.writeJSONAsync(path.join(this.output, this.file), this.manifest)
            this.spinner.succeed("manifest输出完成：" + `${chalk.green(`${getNanoSecTime(this.stime)}`)}`);
        } catch (error) {
            this.spinner.succeed("manifest输出失败：" + JSON.stringify(error));
        }
    }

    private async runPattern(item: Matcher) {
        let resule = await globby(item.from, {
            baseNameMatch: false,
            cwd: path.resolve(process.cwd(), item.base),
            dot: true,
            ignore: [".DS_Store"],
        });
        // console.log(resule, resule.length)

        await Promise.all(
            resule.map(async filepath => {
                let fromFilename = path.resolve(item.base, filepath);

                let data = readFileSync(fromFilename);

                const name = path.basename(filepath, path.extname(filepath));
                const extname = path.extname(filepath).substr(1);

                let hash = getHash(data, this.hash)
                let p = path.dirname(path.join("", filepath)) + "/";
                if (p == "./") {
                    p = "";
                }
                let tp = "[path][name]-[hash].[ext]"
                const toFilename = tp.replace("[name]", name).replace("[hash]", hash).replace("[ext]", extname).replace("[path]", p);
                if (item.to == "" || item.to == null) {
                    item.to = "[path][name].[ext]"
                }
                if (item.to != "[path][name].[ext]") {
                    this.isRename = true;
                    renameSync(fromFilename, path.resolve(item.base, item.to.replace("[name]", name).replace("[hash]", hash).replace("[ext]", extname).replace("[path]", p)))
                }
                this.manifest[filepath] = toFilename;
            })
        );
    }


}