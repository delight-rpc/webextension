const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.base.json')

module.exports = {
  preset: 'ts-jest'
, testEnvironment: 'jsdom'
, testEnvironmentOptions: {
    // 覆盖jsdom环境下的默认选项, 避免在导入时使用browser字段
    customExportConditions: ['node', 'node-addons']
  }
, testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)']
, moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/'
  })
}
