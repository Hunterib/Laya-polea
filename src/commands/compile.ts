import commander from "commander";
import { command } from "../command";
const esbuild = require('esbuild')


export class Compile extends command {
    constructor(program: commander.Command) {
        super(program);
        this.program.alias("build")
        this.program.description('开始编译项目')
    }

    async run() {
        let projPath = this.workspace;
        console.time("编译完成")
        esbuild.build({
            define: { VERSION: '2' },
            entryPoints: [`${projPath}/src/Main.ts`],
            bundle: true,
            minify: false,
            sourcemap: true,
            write: true,
            format: 'iife',
            treeShaking: true,
            outfile: `${projPath}/bin/js/bundle.js`
        }).then((value: any) => {
            console.timeEnd("编译完成")
        })
    }
}