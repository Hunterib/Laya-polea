#!/usr/bin/env node


// const { Command, arguments } = require('commander');
// const { spawn, fork } = require("child_process");
// const path = require("path");
// const esbuild = require('esbuild')
require("../lib/index")


// const program = new Command();

// program.version('0.0.1')
// // .option('-c, --config <path>', 'set config path', './deploy.conf');

// program
//     .command('compile')
//     .alias('build')
//     .description('开始编译项目')
//     .action((options) => {
//         let projPath = program.workspace ? program.workspace : process.cwd();
//         console.time("编译完成")
//         esbuild.build({
//             define: { VERSION: '2' },
//             entryPoints: [`${projPath}/src/Main.ts`],
//             bundle: true,
//             minify: false,
//             sourcemap: true,
//             write: true,
//             format: 'iife',
//             treeShaking: true,
//             outfile: `${projPath}/bin/js/bundle.js`
//         }).then((value) => {
//             console.timeEnd("编译完成")
//             process.exit()
//         })

//     });


// program
//     .command('publish')
//     .description('run setup commands for all envs')
//     .option('-s, --setup_mode <mode>', 'Which setup mode to use', 'normal')
//     .action((env, options) => {
//         // env = env || 'all';
//         // console.log('read config from %s', program.opts().config);
//         // console.log('setup for %s env(s) with %s mode', env, options.setup_mode);

//         let jsonName = program.config ? `${program.config}.json` : "web.json";
//         let projPath = program.workspace ? program.workspace : process.cwd();
//         let gulpFilePath = path.join(projPath, ".laya", "laya_publish.js");
//         let gulpDir = path.join(process.argv[1], "../../node_modules", "gulp/bin/gulp.js");
//         let cmd = [`--gulpfile=${gulpFilePath}`, `--config=${jsonName}`, "publish"];
//         let _gulp = fork(gulpDir, cmd, {
//             silent: true
//         });
//         console.log(gulpDir, cmd)

//         _gulp.stdout.on('data', (data) => {
//             console.log(`${data}`);
//         });

//         _gulp.stderr.on('data', (data) => {
//             console.log(`${data}`);
//         });

//         _gulp.on('close', (code) => {
//             console.log(`exit：${code}`);
//         });
//     });

// program
//     .command('setup [env]')
//     .description('run setup commands for all envs')
//     .option('-s, --setup_mode <mode>', 'Which setup mode to use', 'normal')
//     .action((env, options) => {
//         env = env || 'all';
//         console.log('read config from %s', program.opts().config);
//         console.log('setup for %s env(s) with %s mode', env, options.setup_mode);
//     });

// program
//     .command('exec <script>')
//     .alias('ex')
//     .description('execute the given remote cmd')
//     .option('-e, --exec_mode <mode>', 'Which exec mode to use', 'fast')
//     .action((script, options) => {
//         console.log('read config from %s', program.opts().config);
//         console.log('exec "%s" using %s mode and config %s', script, options.exec_mode, program.opts().config);
//     }).addHelpText('after', `
// Examples:
//   $ deploy exec sequential
//   $ deploy exec async`
//     );

// program.parse(process.argv);




// console.log(process)

// require('../lib/index.js');

// var program = require('commander')
// program.version(require('../package').version)
//     .usage('<command> [options]')
//     .command('generate', 'generate file from a template (short-cut alias: "g")')
//     .command('compile', 'generate file from a template (short-cut alias: "g")')
//     .parse(process.argv)

// program.arguments('<username> [password]')
//   .description('test command', {
//     username: 'user to login',
//     password: 'password for user, if required'
//   })
//   .action((username, password) => {
//     console.log('username:', username);
//     console.log('environment:', password || 'no password given');
//   });

//npm link 安装本地命令