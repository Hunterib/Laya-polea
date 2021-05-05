"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleConfig = void 0;
const esbuild_1 = require("esbuild");
const fs_1 = require("fs");
const vm2_1 = require("vm2");
const path_1 = __importDefault(require("path"));
//编译配置文件并输出
function bundleConfig(projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield esbuild_1.build({
            entryPoints: [projectPath + "/" + ".laya-cli/config.ts"],
            outfile: __dirname + "/../config.js",
            write: false,
            platform: "node",
            bundle: true,
            target: ["es2020", "chrome58", "firefox57", "safari11", "edge16", "node12"],
            incremental: false,
            format: "cjs",
            plugins: [ts2jsPlugin],
        });
        const { text } = result.outputFiles[0];
        const vm = new vm2_1.NodeVM();
        const script = new vm2_1.VMScript(text);
        return yield vm.run(script).default;
    });
}
exports.bundleConfig = bundleConfig;
let ts2jsPlugin = {
    name: "ts2js",
    setup(build) {
        build.onLoad({ filter: /.ts/g }, (args) => {
            let conter = fs_1.readFileSync(args.path).toString();
            let code = conter
                .replace(/built-in/g, `${path_1.default.resolve(__dirname, "../", "built-in")}`)
                .replace(/: ConfigManager/g, "")
                .replace(/:ConfigManager/g, "")
                .replace(/: ConfigCommand/g, "")
                .replace(/:ConfigCommand/g, "")
                .replace(/: UserConfig/g, "")
                .replace(/:UserConfig/g, "")
                .replace(/implements plugins.Command/g, "");
            return { contents: code };
        });
    },
};
