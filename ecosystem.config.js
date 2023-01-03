const dotenv = require("dotenv");
const prodEnv = dotenv.config({ path: "./.env.prod" });
const devEnv = dotenv.config({ path: "./.env.dev" });

module.exports = {
	apps: [
		{
			name: "valbot",
			script: "./prod/index.js",
			watch: false,
			env_dev: {
				MODE: "DEVELOPMENT",
				...devEnv.parsed,
			},
			env_prod: {
				MODE: "PRODUCTION",
				...prodEnv.parsed,
			},
		},
	],
};
