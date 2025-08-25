import {nodeOps }from './nodeOps'
import patchProp from './patchProp'



const renderOrOptions = Object.assign({patchProp},nodeOps)
//将节点操作和属性操作合并
// function createRenderer(options) {

// }
export {renderOrOptions}
// createRenderer(renderOptions).render()