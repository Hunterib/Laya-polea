"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
class command {
    constructor(program) {
        this.spinner = ora_1.default({ text: "Loading unicorns", spinner: "boxBounce2" });
        this.workspace = process.cwd();
        this.workspace = this.workspace.replace(/\\/g, "/");
        this.program = program.command(this.constructor.name.toLowerCase());
        this.program.helpOption("-h, --help", chalk_1.default.green("命令帮助"));
        this.onConstruct();
        this.program.action((arg) => {
            this.stime = process.hrtime.bigint();
            this.execute(arg);
        });
    }
}
exports.command = command;
