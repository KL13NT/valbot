module.exports = {
	testEnvironment: "node",
	collectCoverage: true,
	setupFilesAfterEnv: ["jest-extended"],
	setupFiles: ["dotenv/config"],
	testMatch: null,
	testRegex: ".*\\.test\\.ts",
};
