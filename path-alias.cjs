const path = require("path")
const tsConfigPaths = require("tsconfig-paths")
const tsConfig = require("./tsconfig.json")

const baseUrl = path.join(__dirname, "dist")

tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
})
