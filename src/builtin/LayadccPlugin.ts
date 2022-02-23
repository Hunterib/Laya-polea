import { pluginsCommand } from ".";

var gendcc = require('../../libs/genDcc');

// var options = { lwr: false, cache: false, url: null, escspace: false };
export type LayadccOption = {
    srcpath: string;
    cache?: boolean;
    url?: string;
    lwr?: boolean
    escspace?: boolean
    outpath?: string;
    cout?: string
};
// console.log('用法：');
// console.log('   layadcc 输入目录 [options]');
// console.log('   options:');
// console.log('       -cache 生成cache.');
// console.log('       -lwr 文件路径全部转为小写。');
// console.log('       -url url 生成cache的话，对应的url.');
// console.log('       -esc 把空格转换成%20 ');
// console.log('       -cout outpath cache的输出目录，如果不设置的话，就是在资源目录下。');
// console.log('例如:');
// console.log('   layadcc d:/game/wow -cache -url www.game.com');

export class LayadccPlugin extends pluginsCommand {
    public name: string = "layadcc-plugin";

    /**
     *
     * @param hash "crc32" | "md5" 拷贝重命名方式
     * @param matchers 匹配文件路径规则
     * @param clean 拷贝后是否删除
     */
    constructor(private options: LayadccOption) {
        super();

    }

    async execute() {
        super.execute(arguments);
        if (this.options.outpath == undefined) {
            this.options.outpath = this.output + 'update';
        }

        if (this.options.cache == undefined) {
            this.options.cache = false
        }

        if (this.options.url == undefined) {
            this.options.url = null;
        }

        if (this.options.lwr == undefined) {
            this.options.lwr = false;
        }

        if (this.options.escspace == undefined) {
            this.options.escspace = false;
        }

        return new Promise((resolve) => {
            gendcc.gendcc(this.options.srcpath, this.options.outpath, this.options.cache, this.options.lwr, this.options.url, this.options);
            resolve(null);
        })
    }
};