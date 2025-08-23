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

 



####  设计computed

计算属性：执行后的结果是一个ref不可变的

多次访问此属性，只会执行一次，优化好，里面有一个变量（dirty）来控制执行一次（变成false），数据变化会重置这个变量（变成true）

计算属性也是一个effect，依赖的属性会收集这个计算属性，当值发生变化的时候，会让computedEffect里面的dirty变成true

也有依赖收集的功能，初始化的时候执行一次effect，更新的时候还是会执行effect

在computed返回的属性里面

它自身在赋值变化中是不可变的，它是改变了其他人



> 计算属性aliasName,计算属性依赖的值name
>
> 计算属性也是一个effect,有一个标识dirty=true,访问的时候会,触发name属性的get方法(依赖收集)
>
> 将name属性和计算属性做一个映射,稍后name变化后会触发计算属性的scheduler
>
> 计算属性可能在effect中使用,当取计算属性的时候,会对当前的effect进行依赖收集
>
> 如果name属性变化了,会通知计算属性将dirty变为true(触发计算属性收集的effect,进行重新渲染)



