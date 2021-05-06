import { testcopy } from "./tool";
let config: polea.ConfigManager = {
	buildConfig: (params: polea.ConfigCommand) => {
		return {
			outfile: "js/bundle.js",
			define: { VERSION: testcopy() },
			globalName: "",
		};
	},
};
export default config;
