import { testcopy } from "./tool";
let config: polec.ConfigManager = {
    buildConfig: (params: polec.ConfigCommand) => {
        return {
            outfile: "js/bundle.js",
            define: { VERSION: testcopy() },
            globalName:""
        }
    }
}
export default config;