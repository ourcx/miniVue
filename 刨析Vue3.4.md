#  刨析Vue3.4

![75265917300](C:\Users\zxh\AppData\Local\Temp\1752659173005.png)

####  vue3设计理念

![75266037570](C:\Users\zxh\AppData\Local\Temp\1752660375702.png)

![75266047017](C:\Users\zxh\AppData\Local\Temp\1752660470171.png)

虚拟dom跨平台好，算法高级

![75266248148](C:\Users\zxh\AppData\Local\Temp\1752662481483.png)

编译时是开发打包，运行时是在浏览器上运行

![75266257159](C:\Users\zxh\AppData\Local\Temp\1752662571592.png)

  vue3的组成![75266274442](C:\Users\zxh\AppData\Local\Temp\1752662744422.png)

![75266291221](C:\Users\zxh\AppData\Local\Temp\1752662912211.png)

vue3对ts的支持非常强，可以做到很多东西







####  搭建开发环境

![75266496652](C:\Users\zxh\Desktop\前端\Vue\刨析Vue3.4.assets\1752664966527.png)

羞耻的提升，默认把依赖拍平到node_modules下

而不是直接展示

 处理一些模块的关系,构建vue的核心模块的框架

再去搭建esbuild，就完成了基本的构建了





####  手写reactive

vue3响应式数据和弦通过proxy来实现响应式数据变化

![75275176881](C:\Users\zxh\Desktop\前端\Vue\刨析Vue3.4.assets\1752751768815.png)

COmpostionAPI是vue2的没必要用了

![75275314501](C:\Users\zxh\Desktop\前端\Vue\刨析Vue3.4.assets\1752753145017.png)

effect就是数据变化了执行一次，这个数据要是reactive的东西

需要进行其他收集选项

初始化调用一次，后面变化的时候调用一次



#####  依赖收集原理

 



