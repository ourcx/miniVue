//这个文件会帮我们打包packages下的模块，最终打包js文件
//执行node dev，js，要打包的名字-f 打包的格式==argv

import minimist from 'minimist'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import esbuild from 'esbuild'

const args = minimist(process.argv.slice(2))
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
//获取当前文件路径,file开头,用path处理
//使用process来获取process.argv
const target = args._[0] || 'reactivity' 
//获取要打包的模块名
const format = args.f || 'iife'
//打包后的模块话规范
const require = createRequire(import.meta.url)
//默认也没有

//node里esm模块没有__dirname
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
//入口文件，根据命令行提供的路径来解析
const pkg = require(`../packages/${target}/package.json`)

//根据需要进行打包
esbuild.context({
  entryPoints: [entry],
  outfile: resolve(__dirname, `../package/${target}/dist/${target}.js`),
  bundle: true,
  platform: 'browser',
  sourcemap: true,
  format: format,
  globalName: pkg.buildOptions?.name,
}).then((ctx)=>{
    console.log(`${target} build success`)
    return ctx.watch()
    //持续打包
})
