import { Command } from 'commander';
// import { Compile } from './commands/compile';
// import { publish } from './commands/publish';
// import { task } from './commands/task';
var fs = require('fs');
import path from 'path';

const program = new Command();
program.version('0.0.1');

var dir = __dirname + "/commands";
fs.readdirSync(dir).forEach((file: any) => {
    const pathname = path.join(dir, file)
    if (!fs.statSync(pathname).isDirectory()) {
        let cmd = require(pathname);
        for (const key in cmd) {
            new cmd[key](program);
        }
    }
})

program.parse(process.argv);
