import {nodeOps }from './nodeOps'
import patchProp from './patchProp'

import { creatRenderer } from '@vue/runtime-core'

const renderOrOptions = Object.assign({patchProp},nodeOps)
//将节点操作和属性操作合并
// function createRenderer(options) {

// }

// render方法采用domapi来进行渲染
export const render = (vnode,container)=>{
    return creatRenderer(renderOrOptions).render(vnode,container)
}


export * from '@vue/runtime-core'

// runtieme-dom -> runtime-core ->reactivity
//所以在这里就遇到了不用引入reactivity，而是依赖runtime-core
