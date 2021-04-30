import { command } from "../command";
import { build } from 'esbuild'
import { NodeVM, VMScript } from 'vm2';

export class task extends command {
    protected onConstruct(): void {
        // const res = require('E:/svn/Alpha_Laya/.laya-cli/config');
        // console.log(res)
        this.program.description('自定义命令')

    }

    async run() {
        this.bundleConfigFile().then((code: string) => {
            const vm = new NodeVM();
            const script = new VMScript(code);
            console.log(vm.run(script).buildConfig().commands[0].run());
        });
    }

    async bundleConfigFile() {
        const result = await build({
            entryPoints: ["E:/svn/Alpha_Laya/.laya-cli/config.ts"],
            outfile: __dirname + '/../config.js',
            write: false,
            platform: 'node',
            bundle: true,
            format: "cjs",
        })
        const { text } = result.outputFiles[0]
        return text
    }
}