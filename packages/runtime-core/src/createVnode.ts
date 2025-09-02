import { isString } from "@vue/shared"
import { ShapeFlags } from "packages/shared/src/shapeFlags"


export function isSameVnode (n1,n2) {
  return n1.type === n2.type && n1.key === n2.key
}
export function createVnode (type, props?, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key, //diff算法需要的key
    el: null, //虚拟节点对应真实元素
    shapeFlag
  }

  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
      //或等
      //vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }
    //判断子节点，把子节点的信息整理到vnode.children中，从而实现高效的运算
  }
}
