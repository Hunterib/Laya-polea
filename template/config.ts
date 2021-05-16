import { getversion } from "./getVersion";

let config: polea.ConfigManager = {
    buildConfig: (params: polea.ConfigCommand) => {
        let { command } = params;
        if (command == "compile") {
            return {
                output: "./bin",
                plugins: [new polea.ESBundlePlugin({ define: { DEBUG: true, RELEASE: false }, sourcemap: true })],
            };
        } else if (command == "publish") {
            return {
                output: "./release/" + getversion(),
                plugins: [new polea.ESBundlePlugin({ define: { DEBUG: true, RELEASE: false }, sourcemap: false, minify: true })],
            };
        }
    },
};
export default config;
