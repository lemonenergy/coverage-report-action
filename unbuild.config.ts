import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [],
  failOnWarn: false,
  rollup: {
    commonjs: {
      include: ['node_modules/**']
    },
    resolve: {
      moduleDirectories: ['node_modules'],
      preferBuiltins: true
    }
  }
})
