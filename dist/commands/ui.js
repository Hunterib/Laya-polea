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
exports.ui = void 0;
const path_1 = __importDefault(require("path"));
const command_1 = require("../command");
const child_process_1 = __importDefault(require("child_process"));
const del_1 = __importDefault(require("del"));
const chalk_1 = __importDefault(require("chalk"));
class ui extends command_1.command {
    onConstruct() {
        this.program.description(chalk_1.default.green("导出代码") + chalk_1.default.grey("[使用的是layaair2-cmd中的ui导出]"));
        this.program.option("-w, --workspace <workspacePath>", chalk_1.default.grey("Incoming workspace path"));
        this.program.option("-c --clear", "clear will delete old ui code file.");
        this.program.option("-a --atlas", "generate atlas").option("-d --code", "generate ui code files");
        this.program.option("-m --mode <mode>", "'normal' or 'release', specify 'release' will generate UI code files exclude unused resources.");
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let projPath = this.workspace;
            let clear = this.program.opts().clear || false;
            let mode = this.program.opts().mode || "normal";
            let code = this.program.opts().code || true;
            let atlas = this.program.opts().atlas || true;
            /////////////////////////////////////////////////////////////
            // Call external interface define in LayaAirCmdTool.max.js //
            /////////////////////////////////////////////////////////////
            var args = [];
            let exe = path_1.default.join(__dirname, "/../../libs/", "ProjectExportTools", "LayaAirCmdTool.max.js");
            console.log(exe);
            args.push(path_1.default.join(projPath, "laya", ".laya"));
            args.push(`clear=${clear}`);
            args.push(`releasemode=${mode}`);
            args.push(`exportUICode=${code}`);
            args.push(`exportRes=${atlas}`);
            let cpf = child_process_1.default.fork(exe, args);
            cpf.on("close", (code) => {
                let configpath = path_1.default.join(projPath, "bin", "config.cfg");
                del_1.default(configpath);
            });
        });
    }
}
exports.ui = ui;
