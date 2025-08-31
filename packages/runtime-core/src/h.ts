import { isObject, isString } from '@vue/shared'
import { createVnode } from './createVnode'

export function h (type, propsOrChildren?, children?) {
  let l = arguments.length
  if (l === 2) {
    //h('div',虚拟节点|属性)
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      //属性或者虚拟节点
      if (isVnode(propsOrChildren)) {
        // h('div', h('a'))
        return createVnode(type, null, [propsOrChildren])
      }else{
        return createVnode(type, propsOrChildren)
      }
    }
    // 是数组|文本
    createVnode(type,null,propsOrChildren)
    //普通的属性
    //属性
  } else {
    if (l > 3) {
        children = Array.from(arguments).slice(2)
        //变成数组
    }
    // == 3 |  == 1
    if(l == 3&&isVnode(children)){
        children= [children]
    }
    return createVnode(type, propsOrChildren, children)
  }
}

export function isVnode (value) {
  return value?.__v_isVnode
}

