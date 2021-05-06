import { testcopy } from "./tool";


let config = {
    buildConfig: (params) => {
        console.log("+++", __dirname)
        return {
            define: { VERSION: testcopy() },
            outfile: "js/bundle.js",
            plugins: [new polec.BundlePlugin({})]
        }
    },
}



export default config;