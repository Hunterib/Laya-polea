import { command } from "../command";
import chalk from "chalk";
import express from 'express';


var os = require('os');
function getLocalIP(port: string): Array<string> {
    var map: any = [];
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        // 找到eth0和eth1分别的ip
        var ip: string = null, ip2: string = null;
        ifaces[dev].forEach((details: any) => {
            if (details.family == 'IPv4') {
                ip = details.address;
                map.push(`http://${ip}:${port}`);
            }
        });
    }
    return map;
}


export class Service_platform extends command {
    protected onConstruct() {
        this.program.description(chalk.green("开启项目的静态资源服务器"));
        this.program.option("-p, --port <mode>", "端口[web]", "9060");
    }

    async execute(port: string) {
        if (!port) {
            port = this.program.opts().port;
        }
        let app = express()
        app.listen(port, () => {
            console.log(chalk.redBright(`访问 URL:`));
            console.log(chalk.greenBright(`${getLocalIP(port).join(";\n")};`));
        });
        app.use(express.static(this.workspace));

    }
}
