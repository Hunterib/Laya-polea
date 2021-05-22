import { pluginsCommand } from ".";
import del from "del";

export class CleanPlugin extends pluginsCommand {
    public name: string = "clean-pligin";

    /**
     * 请使用当前目录的相对路径
     * @param patterns 匹配文件路径
     * @param force 是否允许删除当前工作目录之外部目录。
     */
    constructor(private patterns: string | readonly string[], private force: boolean = false) {
        super();
    }

    async execute() {
        super.execute(arguments);
        await del(this.patterns, { force: this.force });
    }
}
