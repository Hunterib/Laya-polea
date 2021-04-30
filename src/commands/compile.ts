import { command } from "../command";
const esbuild = require('esbuild')


export default class Compile extends command {
    protected onConstruct() {
        this.program.description('开始编译项目')
    }

    async run() {
        let projPath = this.workspace;
        console.time("编译完成")
        esbuild.build({
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