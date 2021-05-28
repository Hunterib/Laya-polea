import { pluginsCommand } from ".";

export class ProcessPlugin extends pluginsCommand {
    public name: string = "process-plugin";
    private manifest: any = {};

    /**
     *
     * @param hash "crc32" | "md5" 拷贝重命名方式
     * @param matchers 匹配文件路径规则
     * @param clean 拷贝后是否删除
     */
    constructor(private shell: string) {
        super();
    }

    async execute() {
        super.execute(arguments);
    }
}