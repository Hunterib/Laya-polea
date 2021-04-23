import { Command, arguments } from 'commander';
import { spawn, fork } from "child_process";
import path from "path";
import esbuild from 'esbuild';
import { Compile } from './commands/compile';
import { publish } from './commands/publish';

const program = new Command();
program.version('0.0.1')

new Compile(program);
new publish(program);

program.parse(process.argv);
